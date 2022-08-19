import { assert, details as X } from '@agoric/assert';
import { parse } from '@endo/marshal';
import { makeVatSlot } from '../../lib/parseVatSlots.js';
import { insistMessage } from '../../lib/message.js';
import { makeState } from './state.js';
import { deliverToController } from './controller.js';
import { insistCapData } from '../../lib/capdata.js';

import { makeCListKit } from './clist.js';
import { makeDeliveryKit } from './delivery.js';
import { makeGCKit } from './gc-comms.js';

export const debugState = new WeakMap();

export function buildCommsDispatch(syscall, _state, _helpers, _vatPowers) {
  const state = makeState(syscall);
  const clistKit = makeCListKit(state, syscall);

  function transmit(remoteID, msg) {
    const remote = state.getRemote(remoteID);
    // the vat-tp "integrity layer" is a regular vat, so it expects an argument
    // encoded as JSON
    const sendExplicitSeqNums = state.getSendExplicitSeqNums();
    const seqNum = sendExplicitSeqNums ? remote.nextSendSeqNum() : '';
    remote.advanceSendSeqNum();
    const ackSeqNum = remote.lastReceivedSeqNum();
    const methargs = harden({
      body: JSON.stringify(['transmit', [`${seqNum}:${ackSeqNum}:${msg}`]]),
      slots: [],
    });
    syscall.send(remote.transmitterID(), methargs); // sendOnly
  }

  const gcKit = makeGCKit(state, syscall, transmit);
  const { gcFromRemote, gcFromKernel, processGC } = gcKit;

  const deliveryKit = makeDeliveryKit(
    state,
    syscall,
    transmit,
    clistKit,
    gcFromRemote,
  );
  const { sendFromKernel, resolveFromKernel, messageFromRemote } = deliveryKit;

  // our root object (o+0) is the Comms Controller
  const controller = makeVatSlot('object', true, 0);

  function doStartVat(vatParametersCapData) {
    insistCapData(vatParametersCapData);
    assert.equal(vatParametersCapData.slots.length, 0, 'comms got slots');
    const vatParameters = parse(vatParametersCapData.body) || {};
    const { identifierBase = 0, sendExplicitSeqNums } = vatParameters;
    state.initialize(controller, identifierBase);
    if (sendExplicitSeqNums !== undefined) {
      state.setSendExplicitSeqNums(sendExplicitSeqNums);
    }
  }

  function doDeliver(target, methargs, result) {
    // console.debug(`comms.deliver ${target} r=${result}`);
    insistCapData(methargs);

    if (target === controller) {
      return deliverToController(state, clistKit, methargs, result, syscall);
    }

    const remoteID = state.getRemoteReceiver(target);
    if (remoteID) {
      // XXX TODO DANGER DANGER WARNING DANGER VERY BAD BADNESS FIX ASAP OH NOES
      // The following try/catch intercepts errors triggered by badly
      // constructed or badly parameterized messages from the remote, and logs
      // them instead of allowing them to propagate upward and kill the vat.
      // Ideally, such conditions should just kill the connection to the remote,
      // but we don't yet have the means set up to do that kind of selective
      // disablement.  MORE IMPORTANTLY, HOWEVER, this try/catch will actually
      // intercept ALL errors generated in the processing of the remote message,
      // including ones that aren't the remote's fault and including ones that
      // really should kill the vat.  Unfortunately, pretty much all such error
      // checking is currently done via calls to `assert` or one of its
      // siblings, which doesn't distinguish the appropriate scope of punishment
      // for any transgression.  This blind sledgehammer approach needs to be
      // replaced with a more discriminating mechanism.  Until that is done, the
      // comms vat remains at risk of inconsistency due to internal errors.
      // Moreover, if an individual remote connection gets into an inconsistent
      // state due to misbehavior on the other end, we have no way to kill that
      // connection and thus we risk whatever weirdness may ensue from the
      // remote continuing to think everything's ok (and behaving accordingly)
      // when it's not.  All of this should be fixed soon as practicable.
      // DANGER WILL ROBINSON CASE NIGHTMARE GREEN ELDRITCH HORRORS OH THE HUMANITY
      try {
        const methargsdata = JSON.parse(methargs.body);
        const [method, [message]] = methargsdata;
        assert.equal(method, 'receive', X`unexpected method ${method}`);
        // the vat-tp integrity layer is a regular vat, so when they send the
        // received message to us, it will be embedded in a JSON array
        return messageFromRemote(remoteID, message, result);
      } catch (err) {
        console.log('WARNING: delivery from remote triggered error:', err);
        console.log(`Error happened while processing "${methargs.body}"`);
        return undefined;
      }
    }

    // If we get to this point, the message is not being delivered to a
    // meta-object and so `sendFromKernel()` can proceed with translating the
    // message into local space and processing it.  However, since a message to
    // a meta-object never reaches this translation step, it means that neither
    // a PromiseTable entry nor a local promise ID are ever allocated for such a
    // message's `result` parameter.  If the kernel were to pipeline a
    // subsequent message to that result, that message could, in principle,
    // arrive at this point in the code without there being any local entity to
    // deliver it *to*.  If this were to happen, `sendFromKernel()` would throw
    // an exception when it fails to translate the message target, and
    // consequently kill the vat.  Fortunately, we don't believe any special
    // handling is required for this eventuality because it should never happen:
    // (1) `messageFromRemote()` does not make use of the result parameter at
    // all, and (2) `deliverToController()` always resolves the result with a
    // direct `syscall.resolve()` call in the same crank, short-circuiting the
    // kernel's pipeline delivery mechanism.  If such a case *does* happen, it
    // can only be the result of a kernel bug (i.e., the pipeline short-circuit
    // logic malfunctioned) or a bug in one of the comms controller object's
    // method handlers (i.e., it failed to resolve the result in the same
    // crank).  The resulting abrupt comms vat termination should serve as a
    // diagnostic signal that we have a bug that must be corrected.

    methargs.slots.forEach(s =>
      assert(
        !state.hasMetaObject(s),
        X`comms meta-object ${s} not allowed in message args`,
      ),
    );
    return sendFromKernel(target, methargs, result);
  }

  function filterMetaObjects(vrefs) {
    // Sometimes the bootstrap vat doesn't care very much about comms and
    // allows the root object (the "controller") to be dropped, or one of the
    // receiver objects we create during addRemote(). gc-comms.js doesn't
    // know about these meta objects, so filter them out. Also, always filter
    // out the controller (o+0) even if it isn't in the meta table, because
    // some unit tests (test-demos-comms.js) create a comms vat but never
    // talk to it, which means we never get a delivery, so initializeState()
    // is never called, so o+0 is never added to the meta table.
    return vrefs.filter(
      vref => !(vref === controller || state.hasMetaObject(vref)),
    );
  }

  function doDispatch(vatDeliveryObject) {
    const [type, ...args] = vatDeliveryObject;
    switch (type) {
      case 'startVat': {
        const [vatParameters] = args;
        doStartVat(vatParameters);
        break;
      }
      case 'message': {
        const [targetSlot, msg] = args;
        insistMessage(msg);
        doDeliver(targetSlot, msg.methargs, msg.result);
        break;
      }
      case 'notify': {
        const [resolutions] = args;
        resolveFromKernel(resolutions);
        break;
      }
      case 'dropExports': {
        const [vrefs] = args;
        assert(Array.isArray(vrefs));
        gcFromKernel({ dropExports: filterMetaObjects(vrefs) });
        break;
      }
      case 'retireExports': {
        const [vrefs] = args;
        assert(Array.isArray(vrefs));
        gcFromKernel({ retireExports: filterMetaObjects(vrefs) });
        break;
      }
      case 'retireImports': {
        const [vrefs] = args;
        assert(Array.isArray(vrefs));
        gcFromKernel({ retireImports: filterMetaObjects(vrefs) });
        break;
      }
      case 'bringOutYourDead': {
        // nothing to see here, move along
        break;
      }
      case 'stopVat': {
        // should never be called, but no-op implemented for completeness
        break;
      }
      default:
        assert.fail(X`unknown delivery type ${type}`);
    }
    processGC();
  }

  function dispatch(vatDeliveryObject) {
    try {
      doDispatch(vatDeliveryObject);
    } catch (e) {
      console.log(`error during comms.dispatch`);
      console.log(vatDeliveryObject);
      console.log(e);
      throw e;
    }
  }
  harden(dispatch);

  debugState.set(dispatch, { state, clistKit });

  return dispatch;
}
