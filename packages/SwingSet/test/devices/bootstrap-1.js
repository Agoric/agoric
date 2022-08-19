import { assert, details as X } from '@agoric/assert';
import { extractMessage } from '../vat-util.js';

export default function setup(syscall, state, _helpers, vatPowers) {
  const { testLog } = vatPowers;
  let deviceRef;
  function dispatch(vatDeliverObject) {
    if (vatDeliverObject[0] === 'message') {
      const { method, args } = extractMessage(vatDeliverObject);
      if (method === 'bootstrap') {
        const argb = JSON.parse(args.body);
        const deviceIndex = argb[1].d1.index;
        deviceRef = args.slots[deviceIndex];
        assert.equal(deviceRef, 'd-70', X`bad deviceRef ${deviceRef}`);
      } else if (method === 'step1') {
        testLog(`callNow`);
        const setArgs = harden({ body: JSON.stringify([1, 2]), slots: [] });
        const ret = syscall.callNow(deviceRef, 'set', setArgs);
        testLog(JSON.stringify(ret));
      }
    }
  }
  return dispatch;
}
