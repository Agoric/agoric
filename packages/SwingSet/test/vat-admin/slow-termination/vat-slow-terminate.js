import { Far } from '@endo/far';
import { makePromiseKit } from '@endo/promise-kit';

export function buildRootObject(vatPowers, _vatParameters, baggage) {
  const hold = [];
  return Far('root', {
    alive: () => true,
    dieHappy: completion => vatPowers.exitVat(completion),
    sendExport: () => Far('dude export', {}),
    acceptImports: imports => hold.push(imports),
    forever: async () => makePromiseKit().promise,
    makeVatstore: count => {
      for (let i = 0; i < count; i += 1) {
        baggage.init(`key-${i}`, i);
      }
    },
  });
}
