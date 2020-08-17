import { E } from '@agoric/eventual-send';

const log = console.log;

log(`=> loading bootstrap.js`);

export function buildRootObject(_vatPowers) {
  const target1 = {
    one(_p) {
      log(`target1 in one`);
    },
    two() {
      log(`target1 in two`);
    },
    three(_p) {
      log(`target1 in three`);
    },
    four() {
      log(`target1 in four`);
    },
  };
  const target2 = {
    one(_p) {
      log(`target2 in one`);
    },
    two() {
      log(`target2 in two`);
    },
    three(_p) {
      log(`target2 in three`);
    },
    four() {
      log(`target2 in four`);
    },
  };
  return harden({
    bootstrap(vats) {
      const bob = vats.bob;
      const p1 = E(bob).result();
      E(bob).promise(p1);
      E(bob).run(target1, target2);
    },
  });
}
