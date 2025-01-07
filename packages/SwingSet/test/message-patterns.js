/* eslint dot-notation: "off" */
// I turned off dot-notation so eslint won't rewrite the grep-preserving
// test.stuff patterns.

import { makePromiseKit } from '@endo/promise-kit';
import { q } from '@endo/errors';
import { Far, E } from '@endo/far';
import { ignore } from './vat-util.js';

// Exercise a set of increasingly complex object-capability message patterns,
// for testing.

// This file can be used two ways:
// 1: included by a vat: 'objA' and 'objB' implement the root object on the
//    two sides, and 'setA'/'setB' can be used during bootstrap to establish
//    the initial conditions. The caller (a vat setup function) must provide
//    'E' and 'log'.
// 2: included by the test code: 'patterns' and 'expected' tell the test
//    harness which tests to run and what log messages to expect.

// Each test is identified by the name of a property on objA (like 'a10').
// Each test begins by invoking that method, which may invoke one or more
// methods on objB (with a related name like 'b10' or 'b10_2'). The 'a10'
// property on the 'out' object is a list of log() calls we expect to see if
// the test passes.

// Sometimes the expected output depends upon whether pipelining is enabled
// (which will only occur when using the comms layer, not in the
// direct-to-kernel test). 'outPipelined' holds these alternate expectations.

// Initial Conditions: vat A (which hosts objects 'alice' and 'amy'), and vat
// B (hosting objects 'bob' and 'bert' and 'bill'). Initially alice has
// access to amy/bob/bert but not bill. Bob has access to bert and bill.

// The setup step requires more functionality than the initial tests, but
// that's ok, they're still useful to investigate the messages
// created/delivered by specific patterns

// All messages should be sent twice, to check that the recipient gets the
// same object reference in both messages

function NonError(message) {
  // marshal emits a warning (with stack trace) to the console each time it
  // serializes an Error, which makes it look like tests are failing. We have
  // tests which test 'throw' and Promise rejection to make sure they are
  // signalled correctly. We previously used 'throw Error()' for this, but
  // that provokes the scary-looking warning. Since we aren't trying to
  // exercise *Error* serialization here, merely Promise rejection, we can
  // use a non-Error instead, which avoids the warning.

  // We use a pass-by-copy object, so the receiving side can log a quoted
  // (JSON.stringify) version, and not wind up with Presence object-ids in
  // the log. This does require changes to how the tests log "errors", and to
  // the strings we compare those logs against.
  return harden({ message });
}

export function buildPatterns(log) {
  let a;
  let b;
  let c;

  function setA(newA) {
    a = newA;
  }
  function setB(newB) {
    b = newB;
  }
  function setC(newC) {
    c = newC;
  }

  const patterns = new Map();
  let objA = { toString: () => 'obj-alice' };
  let objB = { toString: () => 'obj-bob' };
  let objC = { toString: () => 'obj-carol' };
  const out = {};
  const outPipelined = {};

  const test = name => patterns.set(name, { local: 'test', comms: 'test' });

  // bob!x()
  test('a10');
  {
    objA.a10 = async () => {
      await E(b.bob).b10();
      log('a10 done');
    };
    objB.b10 = async () => {
      log('b10 called');
    };
  }
  out.a10 = ['b10 called', 'a10 done'];

  // bob!x(data)
  {
    objA.a11 = async () => {
      await E(b.bob).b11('data');
      log('a11 done');
    };
    objB.b11 = async data => {
      log(`b11 got ${data}`);
    };
  }
  out.a11 = ['b11 got data', 'a11 done'];
  test('a11');

  // bob!x({key:'value'})
  {
    objA.a12 = async () => {
      await E(b.bob).b12({ key: 'value' });
      log('a12 done');
    };
    objB.b12 = async data => {
      log(`b12 got ${data.key}`);
    };
  }
  out.a12 = ['b12 got value', 'a12 done'];
  test('a12');

  // bob!x(amy) // new reference
  {
    objA.a20 = async () => {
      await E(b.bob).b20_1(a.amy);
      await E(b.bob).b20_2(a.amy);
      log('a20 done');
    };
    let b20amy;
    objB.b20_1 = async data => {
      b20amy = data;
      log(`b20 got ${data}`);
    };
    objB.b20_2 = async data => {
      log(`match: ${b20amy === data}`);
    };
  }
  out.a20 = ['b20 got [object Alleged: amy]', 'match: true', 'a20 done'];
  test('a20');

  // bob!x({key: amy})
  {
    objA.a21 = async () => {
      await E(b.bob).b21_1({ key1: a.amy });
      await E(b.bob).b21_2({ key2: a.amy });
      log('a21 done');
    };
    let b21amy;
    objB.b21_1 = async data => {
      b21amy = data.key1;
      log(`b21 got ${data.key1}`);
    };
    objB.b21_2 = async data => {
      log(`match: ${b21amy === data.key2}`);
    };
  }
  out.a21 = ['b21 got [object Alleged: amy]', 'match: true', 'a21 done'];
  test('a21');

  // bob!x(bob)
  {
    objA.a30 = async () => {
      await E(b.bob).b30_1(b.bob);
      await E(b.bob).b30_2(b.bob);
      log('a30 done');
    };
    objB.b30_1 = async data => {
      log(`b30 got ${data}`);
      log(`match: ${data === objB}`);
    };
    objB.b30_2 = async data => {
      log(`match: ${data === objB}`);
    };
  }
  out.a30 = ['b30 got obj-bob', 'match: true', 'match: true', 'a30 done'];
  test('a30');

  // bob!x(bert) // old reference
  {
    objA.a31 = async () => {
      await E(b.bob).b31_1(b.bert);
      await E(b.bob).b31_2(b.bert);
      log('a31 done');
    };
    objB.b31_1 = async data => {
      log(`b31 got ${data}`);
      log(`match: ${data === b.bert}`);
    };
    objB.b31_2 = async data => {
      log(`match: ${data === b.bert}`);
    };
  }
  out.a31 = ['b31 got obj-bert', 'match: true', 'match: true', 'a31 done'];
  test('a31');

  // bob!x() -> bob // bob returns himself
  {
    objA.a40 = async () => {
      const ret = await E(b.bob).b40();
      const ret2 = await E(b.bob).b40();
      log(`a40 done, match ${ret === b.bob} ${ret === ret2}`);
    };
    objB.b40 = async () => {
      return b.bob;
    };
  }
  out.a40 = ['a40 done, match true true'];
  test('a40');

  // bob!x() -> bert // old reference
  {
    objA.a41 = async () => {
      const ret = await E(b.bob).b41();
      const ret2 = await E(b.bob).b41();
      log(`a41 done, match ${ret === b.bert} ${ret === ret2}`);
    };
    objB.b41 = async () => {
      return b.bert;
    };
  }
  out.a41 = ['a41 done, match true true'];
  test('a41');

  // bob!x() -> bill // new reference
  {
    objA.a42 = async () => {
      const ret = await E(b.bob).b42();
      const ret2 = await E(b.bob).b42();
      log(`a42 done, ${ret} match ${ret === ret2}`);
    };
    objB.b42 = async () => {
      return b.bill;
    };
  }
  out.a42 = ['a42 done, [object Alleged: bill] match true'];
  test('a42');

  // bob!x() -> <nada> // rejection
  {
    objA.a43 = async () => {
      try {
        const ret = await E(b.bob).b43();
        log(`a43 unexpectedly resolved to ${ret}`);
      } catch (e) {
        log(`a43 rejected with ${q(e)}`);
      }
    };
    objB.b43 = async () => {
      throw NonError('nope');
    };
  }
  out.a43 = ['a43 rejected with {"message":"nope"}'];
  test('a43');

  // bob!x() -> [<nada>] // rejection in result
  {
    objA.a44 = async () => {
      try {
        const ret = await E(b.bob).b44();
        log(`a44 got ret`);
        const ret2 = await ret[0];
        log(`a44 ret[0] unexpectedly resolved to ${ret2}`);
      } catch (e) {
        log(`a44 ret[0] rejected with ${q(e)}`);
      }
    };
    objB.b44 = async () => {
      return harden([Promise.reject(NonError('nope'))]);
    };
  }
  out.a44 = ['a44 got ret', 'a44 ret[0] rejected with {"message":"nope"}'];
  test('a44');

  // bob!x() -> P(data)
  {
    // bob returns a (wrapped) promise, then resolves it to data. We wrap it
    // so the resolution is delivered as a separate event.
    objA.a50 = async () => {
      const ret = await E(b.bob).b50();
      const data = await ret.promise;
      log(`a50 done, got ${data}`);
    };
    const p1 = makePromiseKit();
    objB.b50 = async () => {
      p1.resolve('data');
      return harden({ promise: p1.promise });
    };
  }
  out.a50 = ['a50 done, got data'];
  test('a50');

  // bob!x() -> P(bert) // old reference
  {
    // bob returns a (wrapped) promise, then resolves it to a presence
    objA.a51 = async () => {
      const ret = await E(b.bob).b51();
      const bert = await ret.promise;
      const bert2 = await E(b.bob).b51_2();
      log(`a51 done, got ${bert}, match ${bert === bert2} ${bert === b.bert}`);
    };
    const p1 = makePromiseKit();
    objB.b51 = async () => {
      p1.resolve(b.bert);
      return harden({ promise: p1.promise });
    };
    objB.b51_2 = async () => {
      return b.bert;
    };
  }
  out.a51 = ['a51 done, got [object Alleged: bert], match true true'];
  test('a51');

  // bob!x() -> P(bill) // new reference
  {
    // bob returns a (wrapped) promise, then resolves it to a new presence
    objA.a52 = async () => {
      const ret = await E(b.bob).b52();
      const bill = await ret.promise;
      const bill2 = await E(b.bob).b52_2();
      log(`a52 done, got ${bill}, match ${bill === bill2}`);
    };
    const p1 = makePromiseKit();
    objB.b52 = async () => {
      p1.resolve(b.bill);
      return harden({ promise: p1.promise });
    };
    objB.b52_2 = async () => {
      return b.bill;
    };
  }
  out.a52 = ['a52 done, got [object Alleged: bill], match true'];
  test('a52');

  // bob!x(amy) -> P(amy) // new to bob
  {
    objA.a53 = async () => {
      const ret = await E(b.bob).b53(a.amy);
      const amy2 = await ret.promise;
      log(`a53 done, match ${amy2 === a.amy}`);
    };
    const p1 = makePromiseKit();
    objB.b53 = async amy => {
      p1.resolve(amy);
      return harden({ promise: p1.promise });
    };
  }
  out.a53 = ['a53 done, match true'];
  test('a53');

  // bob!x(P(amy)) -> amy // resolve after sending
  {
    objA.a60 = async () => {
      const p1 = makePromiseKit();
      const p2 = E(b.bob).b60({ promise: p1.promise });
      p1.resolve(a.amy);
      const amy2 = await p2;
      log(`a60 done, match ${amy2 === a.amy}`);
    };
    objB.b60 = async Pamy => {
      const amy = await Pamy.promise;
      return amy;
    };
  }
  out.a60 = ['a60 done, match true'];
  test('a60');

  // bob!x(P(amy)) -> amy // resolve before sending
  {
    objA.a61 = async () => {
      const p1 = Promise.resolve(a.amy);
      const p2 = E(b.bob).b61({ promise: p1 });
      const amy2 = await p2;
      log(`a61 done, match ${amy2 === a.amy}`);
    };
    objB.b61 = async Pamy => {
      const amy = await Pamy.promise;
      return amy;
    };
  }
  out.a61 = ['a61 done, match true'];
  test('a61');

  // bob!x() -> P(bill) // resolve after receipt
  {
    objA.a62 = async () => {
      const p2 = await E(b.bob).b62_1();
      E(b.bob).b62_2();
      const bill = await p2.promise;
      log(`a62 done, got ${bill}`);
    };
    const p1 = makePromiseKit();
    objB.b62_1 = async () => {
      return { promise: p1.promise };
    };
    objB.b62_2 = async () => {
      p1.resolve(b.bill);
    };
  }
  out.a62 = ['a62 done, got [object Alleged: bill]'];
  test('a62');

  // bob!x(amy) -> P(amy) // resolve after receipt
  {
    objA.a63 = async () => {
      const p2 = await E(b.bob).b63_1(a.amy);
      E(b.bob).b63_2();
      const amy2 = await p2.promise;
      log(`a63 done, match ${amy2 === a.amy}`);
    };
    const p1 = makePromiseKit();
    let amyOnBob;
    objB.b63_1 = async amy2 => {
      amyOnBob = amy2;
      return { promise: p1.promise };
    };
    objB.b63_2 = async () => {
      p1.resolve(amyOnBob);
    };
  }
  out.a63 = ['a63 done, match true'];
  test('a63');

  // A allocates promise, sends to B, B sends back
  // a: bob~.one(amyP)
  // b.x(amyP): return [amyP]
  // a: compare p and P(amy) (should resolve to the same thing)
  // exercises #1404 comms.clist.mapInbound non-flip bug in promise addition
  {
    const pX = makePromiseKit();
    const pY = makePromiseKit();
    objA.a64 = async () => {
      // We make an additional promise 'resP' first, as the result of a
      // message-send. The ID is allocated by the sender, just like 'amyP',
      // so the signs should be the same in all message logs. Result promises
      // are handled by a different code path in clist.mapInbound /
      // clist.mapInboundResult, and the #1404 bug lies in the difference
      // between those two paths (mapInboundResult corrected for a bug in
      // mapInbound, but only for the result-promise case). The main reason
      // to send this additional promise is to make the logs easier to read
      // (if the signs of the rpids are different, something is wrong)
      const resPX = E(b.bob).b64_one();
      const argPY = pY.promise; // resolves to alice
      const [resPX2, argPY2] = await E(b.bob).b64_two(resPX, argPY);
      E(b.bob).b64_three(a.amy);
      const [amy2, amy3] = await Promise.all([resPX, resPX2]);
      log(a.amy === amy2);
      log(amy2 === amy3);
      pY.resolve(a.alice);
      const [alice2, alice3] = await Promise.all([argPY, argPY2]);
      log(a.alice === alice2);
      log(alice2 === alice3);
    };
    objB.b64_one = async () => {
      return pX.promise; // resolves to amy
    };
    objB.b64_two = (resPX, argPY) => {
      return harden([resPX, argPY]);
    };
    objB.b64_three = amy => {
      pX.resolve(amy);
    };
  }
  out.a64 = ['true', 'true', 'true', 'true'];
  test('a64');

  // bob!x() -> P(bill) // reject after receipt
  {
    objA.a65 = async () => {
      const p2 = await E(b.bob).b65_1();
      E(b.bob).b65_2();
      try {
        const bill = await p2.promise;
        log(`a65 unexpectedly resolved to ${bill}`);
      } catch (e) {
        log(`a65 rejected with ${q(e)}`);
      }
    };
    const p1 = makePromiseKit();
    objB.b65_1 = async () => {
      return { promise: p1.promise };
    };
    objB.b65_2 = async () => {
      p1.reject(NonError('nope'));
    };
  }
  out.a65 = ['a65 rejected with {"message":"nope"}'];
  test('a65');

  // p=bob!x(p) // early reference to result promise, issue #5189
  {
    objA.a66 = async () => {
      // E() hardens the arguments before returning the promise, so it
      // prevents the following direct way to build a message that
      // references its own result:
      //
      // const args = { a: 1 };
      // const p = E(b.bob).b66_1(args);
      // args.p = p;
      //
      // We can't provoke that from userspace, so we exercise a subset
      // of the concerns: a result promise is first seen in arguments
      // (of a different message).

      const p1 = E(b.bob).b66_wait(); // doesn't resolve for a while
      const p2 = E(p1).msg2(); // so msg2 is stalled waiting for p1
      const p3 = E(b.bob).b66_msg1(p2); // and msg1 arrives first
      await E(b.bob).b66_flush();
      E(b.bob).b66_resolve();
      await p1;
      await p2;
      await p3;
    };
    const pk = makePromiseKit();
    objB.b66_wait = async () => pk.promise;
    objB.b66_msg1 = p2 => {
      log('one');
      p2.then(() => log('p2 resolved'));
    };
    objB.b66_flush = () => 0;
    const target = Far('target', {
      msg2: () => {
        log('two');
        return 'res';
      },
    });
    objB.b66_resolve = () => {
      pk.resolve(target);
    };
  }
  out.a66 = ['one', 'two', 'p2 resolved'];
  test('a66');

  // bob!pipe1()!pipe2()!pipe3() // pipelining
  {
    objA.a70 = async () => {
      const p1 = E(b.bob).b70_pipe1();
      const p2 = E(p1).pipe2();
      const p3 = E(p2).pipe3();
      p1.then(_ => log('p1.then'));
      p2.then(_ => log('p2.then'));
      p3.then(_ => log('p3.then'));
    };
    objB.b70_pipe1 = async () => {
      log(`pipe1`);
      const pipe2 = Far('pipe2', {
        pipe2() {
          log(`pipe2`);
          const pipe3 = Far('pipe3', {
            pipe3() {
              log(`pipe3`);
            },
          });
          return pipe3;
        },
      });
      return pipe2;
    };
  }
  out.a70 = ['pipe1', 'p1.then', 'pipe2', 'p2.then', 'pipe3', 'p3.then'];
  outPipelined.a70 = [
    'pipe1',
    'pipe2',
    'pipe3',
    'p1.then',
    'p2.then',
    'p3.then',
  ];
  test('a70');

  // px!pipe1()!pipe2()!pipe3(); px.resolve()
  {
    objA.a71 = async () => {
      // todo: all the pipelined calls (pipe123) get sent to the kernel a
      // turn after the two call-to-presence calls (getpx/resolvex), which is
      // a bit weird. Feels like p.post gets one extra stall.
      // todo: is this still true?
      const px = E(b.bob).b71_getpx();
      const p1 = E(px).pipe1();
      const p2 = E(p1).pipe2();
      const p3 = E(p2).pipe3();
      p1.then(_ => log('p1.then'));
      p2.then(_ => log('p2.then'));
      p3.then(_ => log('p3.then'));
      E(b.bob).b71_resolvex();
    };
    const p1 = makePromiseKit();
    objB.b71_getpx = async () => p1.promise;
    objB.b71_resolvex = async () => {
      const x = Far('x', {
        pipe1() {
          log(`pipe1`);
          const pipe2 = Far('pipe2', {
            pipe2() {
              log(`pipe2`);
              const pipe3 = Far('pipe3', {
                pipe3() {
                  log(`pipe3`);
                },
              });
              return pipe3;
            },
          });
          return pipe2;
        },
      });
      p1.resolve(x);
    };
  }
  out.a71 = ['pipe1', 'p1.then', 'pipe2', 'p2.then', 'pipe3', 'p3.then'];
  outPipelined.a71 = [
    'pipe1',
    'pipe2',
    'pipe3',
    'p1.then',
    'p2.then',
    'p3.then',
  ];
  test('a71');

  // px!pipe1()!pipe2()!pipe3(); px.resolve() but better
  {
    objA.a72 = async () => {
      const px = E(b.bob).b72_getpx();
      const p1 = E(px).pipe1();
      const p2 = E(p1).pipe2();
      const p3 = E(p2).pipe3();
      p1.then(_ => log('p1.then'));
      p2.then(_ => log('p2.then'));
      p3.then(_ => log('p3.then'));
      // make sure px isn't available for delivery until pipe123 are queued
      // in the kernel
      E(b.bob)
        .b72_wait()
        .then(() => E(b.bob).b72_resolvex());
    };
    const p1 = makePromiseKit();
    objB.b72_wait = async () => 0;
    objB.b72_getpx = async () => p1.promise;
    objB.b72_resolvex = async () => {
      const x = Far('x', {
        pipe1() {
          log(`pipe1`);
          const pipe2 = Far('pipe2', {
            pipe2() {
              log(`pipe2`);
              const pipe3 = Far('pipe3', {
                pipe3() {
                  log(`pipe3`);
                },
              });
              return pipe3;
            },
          });
          return pipe2;
        },
      });
      p1.resolve(x);
    };
  }
  out.a72 = ['pipe1', 'p1.then', 'pipe2', 'p2.then', 'pipe3', 'p3.then'];
  outPipelined.a72 = [
    'pipe1',
    'pipe2',
    'pipe3',
    'p1.then',
    'p2.then',
    'p3.then',
  ];
  test('a72');

  // Exercise bug #1400. We set up two messages:
  //   pipe1 = bob~.one()
  //   pipe1~.two()
  // but their handling must meet two ordering constraints:
  // 1: left-comms transmits two() before learning about pipe1 resolving
  // 2: right-comms receives two() *after* learning about pipe1 resolving
  // to achieve this, we changed loopbox() to deliver one message at a time
  {
    objA.a73 = async () => {
      const pipe1 = E(b.bob).b73_one();
      const p2 = E(pipe1).two();
      ignore(p2);
    };
    objB.b73_one = () =>
      Far('one', {
        two: () => log('two'),
      });
  }
  out.a73 = ['two'];
  test('a73');

  // 80-series: exercise handling of resolved promises
  //
  // We retire promise IDs across the vat-kernel boundary upon resolution,
  // under the theory that most resolved promises are never referenced again,
  // so we can reap storage savings by forgetting their IDs (and allocate new
  // ones again if we're wrong). The vat-kernel boundary is synchronous, in
  // that a kernel->vat resolution delivery is seen by the vat before
  // creating any vat->kernel syscalls, so the kernel can expect the vat to
  // process the retirement first, and won't reference the retired ID after
  // the delivery begins. The vat->kernel boundary is similar: no new
  // deliveries will happen until after the kernel has processed the
  // retirement syscall.

  // Unfortunately the comms-comms boundary (between two remote machines) is
  // not synchronous: there may already be messages in flight, containing
  // promise-ids which the recipient has already resolved. So we cannot
  // retire these promise-ids without a specific ack/decref message, which is
  // not yet implemented.

  // So the recipient of a remote message may have to tell their kernel about
  // an old promise. The kernel will have forgotten about the ID, so we can
  // re-use the same ID, and the kernel will allocate a new kpid for it. But
  // we must re-resolve it into the kernel, we means we (comms) must remember
  // the resolution.

  // These tests are broken into a 2x2x2 matrix (XY times AB times 12):

  // first step: b.comms sees a promise for the first time
  //  X: it arrives from local kernel (as an argument of an outbound message)
  //  Y: it arrives from A (as the result= of an inbound message )
  // second step: b.comms sees the promise get resolved (by local kernel)
  //  A: promise is resolved to something on A
  //  B: promise is resolved to something on B
  //  (later) C: promise is resolved to something on third-party C
  // third step:
  //  1: b.comms sees promise arrive as target of an inbound message
  //  2: b.comms sees promise arrive in arguments of an inbound message
  // fourth step: check that the two promises are equivalent
  //
  // We cannot compare promises for identity, so instead we send a message to
  // the third-step one and make sure it arrives at the right place. For case
  // X, we also wait for it to resolve and then compare the resolutions for
  // identity.

  // b.comms won't ever see an unresolved promise arrive from the kernel,
  // because of the retired-promise policy TODO: b.comms *shouldn't* see
  // remote machine reference a promise they resolved themselves, but a
  // buggy/malicious one might, so we should be prepared. There's no simple
  // way to test that case, however.

  // XA1
  {
    objA.a80 = async () => {
      const [aliceP] = await E(b.bob).b80_one();
      E(b.bob).b80_two(a.alice); // tell bob to resolve it
      E(aliceP).a80_three('calling alice'); // 1: promise second appears as target
    };
    const p1 = makePromiseKit();
    objB.b80_one = () => {
      const aliceP = p1.promise;
      return harden([aliceP]); // X: promise first arrives as argument
    };
    objB.b80_two = alice => {
      p1.resolve(alice); // resolves to something on A
    };
    objA.a80_three = () => log('three');
  }
  out.a80 = ['three'];
  test('a80');

  // XA2
  {
    objA.a81 = async () => {
      const [aliceP] = await E(b.bob).b81_one();
      E(b.bob).b81_two(a.alice); // tell bob to resolve it
      E(b.bob).b81_three(a.alice, aliceP); // 2: promise second appears as argument
    };
    const p1 = makePromiseKit();
    objB.b81_one = () => {
      const aliceP = p1.promise;
      return harden([aliceP]); // X: promise first arrives as argument
    };
    objB.b81_two = alice => {
      p1.resolve(alice); // resolves to something on A
    };
    objB.b81_three = async (alice, aliceP) => {
      // commsB hears about the promise in an argument
      const alice2 = await aliceP;
      log(alice2 === alice);
      E(aliceP).a81_four(); // make sure we can send to it
    };
    objA.a81_four = () => log('four');
  }
  out.a81 = ['true', 'four'];
  test('a81');

  // XB1
  {
    objA.a82 = async () => {
      const [billP] = await E(b.bob).b82_one();
      // now send two messages in quick succession, so commsA will send the
      // second before hearing about the resolution of billP. The
      // cross-machine queue will ensure that commsB processes the first
      // (resolving billP) before processing the second (targeting billP).
      E(b.bob).b82_two(); // tell bob to resolve it
      E(billP).log_bill('three'); // 1: promise second appears as target
    };
    const p1 = makePromiseKit();
    objB.b82_one = () => {
      const billP = p1.promise;
      return harden([billP]); // X: promise first arrives as argument
    };
    objB.b82_two = () => {
      p1.resolve(b.bill); // resolves to something on B
    };
  }
  out.a82 = ['three'];
  test('a82');

  // XB2
  {
    objA.a83 = async () => {
      const [billP] = await E(b.bob).b83_one();
      E(b.bob).b83_two(); // tell bob to resolve it
      E(b.bob).b83_three(billP); // 2: promise second appears as argument
    };
    const p1 = makePromiseKit();
    objB.b83_one = () => {
      const billP = p1.promise;
      return harden([billP]); // X: promise first arrives as argument
    };
    objB.b83_two = () => {
      p1.resolve(b.bill); // resolves to something on B
    };
    objB.b83_three = async billP => {
      // commsB hears about the promise in an argument
      const bill2 = await billP;
      log(b.bill === bill2);
      E(billP).log_bill('three');
    };
  }
  out.a83 = ['true', 'three'];
  test('a83');

  // YA1
  {
    objA.a84 = async () => {
      const aliceP = E(b.bob).b84_one(); // Y: promise first arrives as a result
      E(b.bob).b84_two(a.alice); // tell bob to resolve it
      E(aliceP).a84_three('calling alice'); // 1: promise second appears as target
    };
    const p1 = makePromiseKit();
    objB.b84_one = async () => {
      const aliceP = p1.promise;
      return aliceP;
    };
    objB.b84_two = alice => {
      p1.resolve(alice); // resolves to something on A
    };
    objA.a84_three = () => log('three');
  }
  out.a84 = ['three'];
  test('a84');

  // YA2
  {
    objA.a85 = async () => {
      const aliceP = E(b.bob).b85_one(); // Y: promise first arrives as a result
      E(b.bob).b85_two(a.alice); // tell bob to resolve it
      E(b.bob).b85_three(a.alice, aliceP); // 2: promise second appears as argument
    };
    const p1 = makePromiseKit();
    objB.b85_one = async () => {
      const aliceP = p1.promise;
      return harden(aliceP);
    };
    objB.b85_two = alice => {
      p1.resolve(alice); // resolves to something on A
    };
    objB.b85_three = async (alice, aliceP) => {
      // commsB hears about the promise in an argument
      const alice2 = await aliceP;
      log(alice2 === alice);
      E(aliceP).a85_four(); // make sure we can send to it
    };
    objA.a85_four = () => log('four');
  }
  out.a85 = ['true', 'four'];
  test('a85');

  // YB1
  {
    objA.a86 = async () => {
      const billP = E(b.bob).b86_one(); // Y: promise first arrives as a result
      E(b.bob).b86_two(); // tell bob to resolve it
      E(billP).log_bill('three'); // 1: promise second appears as a target
    };
    const p1 = makePromiseKit();
    objB.b86_one = async () => {
      const billP = p1.promise;
      return harden(billP);
    };
    objB.b86_two = () => {
      p1.resolve(b.bill); // resolves to something on B
    };
  }
  out.a86 = ['three'];
  test('a86');

  // YB2
  {
    objA.a87 = async () => {
      const billP = E(b.bob).b87_one(); // Y: promise
      E(b.bob).b87_two(); // tell bob to resolve it
      E(b.bob).b87_three(billP); // 2: promise second appears as argument
    };
    const p1 = makePromiseKit();
    objB.b87_one = async () => {
      const billP = p1.promise;
      return harden(billP);
    };
    objB.b87_two = () => {
      p1.resolve(b.bill); // resolves to something on B
    };
    objB.b87_three = async billP => {
      // commsB hears about the promise in an argument
      const bill2 = await billP;
      log(b.bill === bill2);
      E(billP).log_bill('three');
    };
  }
  out.a87 = ['true', 'three'];
  test('a87');

  // 90-series: test third-party references

  // A: c!c90_one(bert)
  // C: bert!log_bert()
  {
    objA.a90 = async () => {
      await E(c.carol).c90_one(b.bert);
    };
    objC.c90_one = bert => {
      log('carol got bert');
      E(bert).log_bert('hi bert');
    };
  }
  out.a90 = ['carol got bert', 'hi bert'];
  test('a90');

  // A: c!c91_one(Pbert)
  // C: Pbert!log_bert()
  {
    objA.a91 = async () => {
      const { promise: Pbert, resolve } = makePromiseKit();
      await E(c.carol).c91_one(Pbert);
      resolve(b.bert);
    };
    objC.c91_one = Pbert => {
      log('carol got Pbert');
      E(Pbert).log_bert('hi bert');
    };
  }
  out.a91 = ['carol got Pbert', 'hi bert'];
  test('a91');

  // 100-series: test cross-referential promise resolutions
  test('a100');
  {
    objA.a100 = async () => {
      const apa = await E(b.bob).b100_1();
      const apb = await E(b.bob).b100_2();
      const pa = apa[0];
      const pb = apb[0];
      E(b.bob).b100_3([pa], [pb]);
      try {
        const pa2 = (await pa)[0];
        const pb2 = (await pb)[0];
        const pa3 = (await pa2)[0];
        const pb3 = (await pb2)[0];
        log(`${pb3 !== pa3}`);
        log(`${pa3 === pb2}`);
      } catch (e) {
        log(`a100 await failed with ${e}`);
      }
    };
    const p1 = makePromiseKit();
    const p2 = makePromiseKit();
    objB.b100_1 = () => {
      return [p1.promise];
    };
    objB.b100_2 = () => {
      return [p2.promise];
    };
    objB.b100_3 = (apa, apb) => {
      p1.resolve(apb);
      p2.resolve(apa);
    };
  }
  out.a100 = ['true', 'true'];

  objA = Far('alice', objA);
  objB = Far('bob', objB);
  objC = Far('carol', objC);

  // TODO: kernel-allocated promise, either comms or kernel resolves it,
  // comms needs to send into kernel again

  // TODO: vat-allocated promise, either comms or kernel resolves it, comms
  // needs to send into kernel again
  return harden({
    setA,
    setB,
    setC,
    patterns,
    objA,
    objB,
    objC,
    expected: out,
    expected_pipelined: outPipelined,
  });
}
