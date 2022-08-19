import { assert } from '@agoric/assert';
import { parseVatSlot } from '../../lib/parseVatSlots.js';
import { parseRemoteSlot } from './parseRemoteSlot.js';

// A note on verb polarity:
//
// On any vat-kernel or comms-comms boundary, the "exporter" is the side who
// first sent the object reference, and thus "owns" the object: any messages
// sent to the object are sent to the exporting side. Think of this as
// "upstream". The side which first *received* the reference is the importer,
// think of them as downstream.
//
// On the vat-kernel boundary, where there is a clear symmetry break, our
// rule is "vats are egocentric". Vats think of themselves as the center of
// the universe, so naturally vat exports are more interesting than anything
// else, so the vat assigns positive identifiers to exported object
// references (i.e. `o+0` is the exported root object, `o+1` is the first
// non-root export). When the vat *imports* something from the kernel, it
// receives a negative identifier (i.e. the kernel might send `o-2` in the
// argument of a delivery).
//
// Likewise, the GC operations are described from the vat's point of view.
// When the vat no longer needs an imported object, it calls
// `syscall.dropImport` to tell the kernel "I'm dropping this thing I
// imported from you". `syscall.retireImport` is how the vat tells the kernel
// it can no longer recognize the object and the c-list entry should be
// deleted. Both messages flow "upstream" from the importing vat to the
// kernel. Then, if all importers have dropped a kernel object, and nothing
// else in the kernel can reach it, the kernel will send
// `dispatch.dropExport` and/or `dispatch.retireExport` to inform the
// upstream (exporting) vat that the object is no longer reachable or
// recognizable.
//
// If a vat's export was dropped by downstream (the kernel sent
// `dispatch.dropExport`), and the exported object is entirely deleted, the
// exporting vat will send `syscall.retireExport` downstream. This lets the
// kernel know that any downstream vats still hoping to recognize the object
// again (i.e. they still have c-list entries, but those entries are marked
// as unreachable) should give up. The kernel will send
// `dispatch.retireImport` into these downstream vats.
//
// On comms-comms edges, where we have no symmetry-breaking distinction, our
// rule is "the comms protocol is exceedingly polite". All messages are
// formatted for the benefit of the *recipient*, not the sender. The
// recipient's exports get the positive identifiers, so if comms A sends a
// message to comms B, the target of that message will be e.g. `ro+4`. The
// arguments can introduce new objects with e.g. `ro-5`, and those represent
// exports of the sender (imports of the receiver). The remote c-lists use
// different polarities in the rrefs on their inbound and outbound sides: the
// exporter's outbound side maps `lo6` to `ro-7`, while their inbound side
// maps `ro+7` to `lo6`. This maximizes convenience for message translation:
// outbound messages are translated through the outbound side of the c-list,
// inbound messages use the inbound side. We only need to manually flip the
// polarity of a reference when populating the c-list or finding the other
// half (for deletion).
//
// For GC messages, the comms protocol again formats messages for the
// recipient. When a downstream comms is dropping something it imported from
// upstream, it sends a `dropExport`, followed by a `retireExport` if/when
// the object also becomes unrecognizable. When the upstream comms has
// deleted an unreachable exported object, it informs downstream with a
// `retireImport`. These verbs match the ones used by a kernel as it does
// `dispatch` calls into a vat, but they are the opposite of what a vat does
// when it makes syscalls into the kernel.
//
// Hence, the code below uses operations that are mostly parallel, but not
// completely. The `gcFromRemote` and `gcFromKernel` verbs are the same. But
// the syscalls made by `gcToKernel` will be the opposite of the upstream
// messages built by `gcToRemote`. The actions built by processMaybeFree use
// the upstream polarity, so syscall names must be flipped.
//
// The other difference between remote and kernel is that the kernel is
// synchronous, whereas remote messages can cross on the wire. `gcFromRemote`
// has additional checks to ignore late messages. The three cases are:

// * upstream (re-)exports an object, then it receives a `dropExport` from
//   downstream: we check the ackSeqNum to see whether the upstream message
//   was "informed" (i.e. it was sent after the receipt of the re-export),
//   and we ignore it otherwise. The downstream comms will receive the
//   re-export in a moment, and re-set the 'reachable' flag they just
//   cleared.

// * same, except upstream receives `retireExport` from downstream: we
//   perform the same "informed" check and ignore the message if not. We also
//   ignore the message if the object reference was missing entirely, which
//   happens when we send a `retireImport` downstream and it crosses the
//   upwards-travelling `retireExport` on the wire

// * downstream sends `retireExport` to upstream, then receives
//   `retireImport` from upstream. The downstream comms vat will notice that
//   the `retireImport` references an unknown object ID. It should simply
//   ignore the message.

function makeGCKit(state, syscall, transmit) {
  /* messages from the kernel */

  function checkFromKernel(kfref, shouldBeAllocatedByVat) {
    const { type, allocatedByVat } = parseVatSlot(kfref);
    assert.equal(type, 'object');
    assert.equal(allocatedByVat, shouldBeAllocatedByVat);
    const lref = state.mapFromKernel(kfref);
    return lref;
  }

  function gcFromKernel(gc) {
    // console.log(`gcFromKernel:`, gc);
    const { dropExports = [], retireExports = [], retireImports = [] } = gc;
    for (const kfref of dropExports) {
      const lref = checkFromKernel(kfref, true);
      // kernel shouldn't double-drop
      assert(state.isReachableByKernel(lref), lref);
      // allocatedByVat means kernel is importing from comms
      const isImportFromComms = true;
      state.clearReachableByKernel(lref, isImportFromComms);
    }
    for (const kfref of retireExports) {
      const lref = checkFromKernel(kfref, true);
      // hedge against outbound retire racing ahead, not sure if necessary
      if (lref) {
        // kernel shouldn't be retiring anything that's still reachable
        assert(!state.isReachableByKernel(lref));
        state.deleteKernelMapping(lref);
        // processGC will notify the exporter
      }
    }
    for (const kfref of retireImports) {
      const lref = checkFromKernel(kfref, false);
      // hedge against race, not sure if necessary
      if (lref) {
        // kernel shouldn't be retiring anything that's still reachable
        assert(!state.isReachableByKernel(lref));
        state.deleteKernelMapping(lref);
        // processGC will notify the remaining importers
      }
    }
  }

  /* messages from remotes */

  function parseGCMessage(message) {
    // the GC message is a newline-joined set of lines, each of the form
    // `gc:$type:$rref`, where $type is one of 'dropExport', 'retireExport',
    // or 'retireImport'
    const subMessages = message.split('\n');
    const gc = { dropExports: [], retireExports: [], retireImports: [] };
    const types = ['dropExport', 'retireExport', 'retireImport'];
    for (const submsg of subMessages) {
      const [name, type, rref] = submsg.split(':');
      assert.equal(name, 'gc');
      assert(types.includes(type), `unknown GC message type ${type}`);
      assert.equal(parseRemoteSlot(rref).type, 'object');
      gc[`${type}s`].push(rref);
    }
    return gc;
  }

  function checkFromRemote(remote, ackSeqNum, rref) {
    // was this action 'informed'? i.e. had they seen our most recent export?
    const lref = remote.mapFromRemote(rref);
    // if we've forgotten about them entirely, clearly they were uninformed
    let informed = false;
    if (lref && ackSeqNum >= remote.getLastSent(lref)) {
      informed = true;
    }
    return { lref, informed };
  }

  function gcFromRemote(remoteID, message, ackSeqNum) {
    const remote = state.getRemote(remoteID);
    const gc = parseGCMessage(message);
    const { dropExports, retireExports, retireImports } = gc;
    for (const rref of dropExports) {
      const { lref, informed } = checkFromRemote(remote, ackSeqNum, rref);
      if (informed) {
        assert(remote.isReachable(lref)); // no double-drop
        const isImportFromComms = true;
        remote.clearReachable(lref, isImportFromComms);
      }
    }
    for (const rref of retireExports) {
      const { lref, informed } = checkFromRemote(remote, ackSeqNum, rref);
      if (informed) {
        // cross-on-wire lets us see spurious retireExport
        assert(!remote.isReachable(lref)); // retire-after-drop
        remote.deleteRemoteMapping(lref);
      }
    }
    for (const rref of retireImports) {
      const lref = remote.mapFromRemote(rref);
      if (lref) {
        // cross-on-wire lets us see spurious retireImport
        assert(!remote.isReachable(lref)); // retire-after-drop
        remote.deleteRemoteMapping(lref);
        // processGC will notify the remaining importers
      }
    }
  }

  /* messages to kernel */

  function gcToKernel(dropExports, retireExports, retireImports) {
    let kfrefs = [];
    for (const lref of dropExports) {
      assert(state.isReachableByKernel(lref));
      // when we drop, kernel is always the exporter
      const isImportFromComms = false;
      state.clearReachableByKernel(lref, isImportFromComms);
      const kfref = state.mapToKernel(lref);
      assert(kfref);
      kfrefs.push(kfref);
    }
    if (kfrefs.length) {
      // syscall names are flipped
      syscall.dropImports(kfrefs);
    }

    kfrefs = [];
    for (const lref of retireExports) {
      assert(!state.isReachableByKernel(lref));
      const kfref = state.mapToKernel(lref);
      assert(kfref);
      state.deleteKernelMapping(lref);
      kfrefs.push(kfref);
    }
    if (kfrefs.length) {
      syscall.retireImports(kfrefs);
    }

    kfrefs = [];
    for (const lref of retireImports) {
      assert(!state.isReachableByKernel(lref));
      const kfref = state.mapToKernel(lref);
      assert(kfref);
      state.deleteKernelMapping(lref);
      kfrefs.push(kfref);
    }
    if (kfrefs.length) {
      syscall.retireExports(kfrefs);
    }
  }

  /* messages to remotes */

  function gcToRemote(remoteID, dropExports, retireExports, retireImports) {
    const r = state.getRemote(remoteID);
    const msgs = [];

    for (const lref of dropExports) {
      assert(r.isReachable(lref));
      const isImportFromComms = false; // we send drops to the exporter
      r.clearReachable(lref, isImportFromComms);
      const rref = r.mapToRemote(lref);
      assert(rref);
      msgs.push(`gc:dropExport:${rref}`);
    }

    for (const lref of retireExports) {
      assert(!state.isReachableByKernel(lref));
      const rref = r.mapToRemote(lref);
      assert(rref);
      r.deleteRemoteMapping(lref);
      msgs.push(`gc:retireExport:${rref}`);
    }

    for (const lref of retireImports) {
      assert(!state.isReachableByKernel(lref));
      const rref = r.mapToRemote(lref);
      assert(rref);
      r.deleteRemoteMapping(lref);
      msgs.push(`gc:retireImport:${rref}`);
    }

    // console.log(`commsGC transmit: ${msgs.join('  ')}`);
    transmit(remoteID, msgs.join('\n'));
  }

  /* end-of-delivery processing, provokes outbound messages */

  function processGC() {
    const actions = state.processMaybeFree();
    // remote -> { dropExport, retireExport, retireImport }
    const work = new Map();

    // sort actions into a single message (batch) per remote
    for (const action of actions.values()) {
      const [owner, type, lref] = action.split(' ');
      // Each action is a verb like what the kernel would dispatch into a
      // vat, or comms would send to a peer. We will have to flip
      // kernel-bound syscall names.
      assert(
        ['dropExport', 'retireExport', 'retireImport'].includes(type),
        type,
      );
      let messages = work.get(owner);
      if (!messages) {
        messages = { dropExport: [], retireExport: [], retireImport: [] };
        work.set(owner, messages);
      }
      messages[type].push(lref);
    }

    const remoteIDs = Array.from(work.keys());
    remoteIDs.sort();
    for (const remoteID of remoteIDs) {
      const { dropExport, retireExport, retireImport } = work.get(remoteID);
      dropExport.sort();
      retireExport.sort();
      retireImport.sort();
      if (remoteID === 'kernel') {
        gcToKernel(dropExport, retireExport, retireImport);
      } else {
        gcToRemote(remoteID, dropExport, retireExport, retireImport);
      }
    }
    // TODO: when #2069 auxdata is added, retirement might free additional
    // objects. For thoroughness, we'll need to keep calling processGC()
    // until the `actions` set is empty. For efficiency, we should accumulate
    // all the kernel and remote messages across all loops, and only send
    // them at the very end.
  }

  return harden({ gcFromRemote, gcFromKernel, processGC });
}
harden(makeGCKit);
export { makeGCKit };
