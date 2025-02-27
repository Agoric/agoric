import { makeDurableZone } from '@agoric/zone/durable.js';
import { Far } from '@endo/far';

console.log('module def');
/**
 * @param {unknown} _vatPowers
 * @param {unknown} _vatParameters
 * @param {import('@agoric/vat-data').Baggage} baggage
 */
export const buildRootObject = (_vatPowers, _vatParameters, baggage) => {
  console.log('buildRootObject');
  const zone = makeDurableZone(baggage);
  const seen = zone.setStore('seen');

  return Far('Boot', {
    bootstrap: () => {
      console.log('bootstrap');
    },
    see: it => {
      seen.add(it);
      const size = seen.getSize();
      //   console.debug('added', it, size);
      return size;
    },
  });
};
