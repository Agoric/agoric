import { Far, E } from '@endo/far';
import { assert } from '@agoric/assert';
import { makePromiseKit } from '@endo/promise-kit';

const NUM_SENSORS = 39;

const insistMissing = (ref, isCollection = false) => {
  let p;
  if (isCollection) {
    p = E(ref).set(1, 2);
  } else {
    p = E(ref).get();
  }
  return p.then(
    () => {
      throw Error('ref should be missing');
    },
    err => {
      assert.equal(err.message, 'vat terminated');
    },
  );
};

export const buildRootObject = () => {
  let vatAdmin;
  let ulrikRoot;
  /** @type {import('@agoric/swingset-vat').VatAdminFacet} */
  let ulrikAdmin;
  const marker = Far('marker', {});
  // for debugging, this array starts with a dummy element so
  // the vref of each contained object in an importing vat
  // (o-NN where NN starts at 1) is aligned with its index
  /** @type {[string, ...object]} */
  const importSensors = ['skip0'];
  for (let i = 1; i <= NUM_SENSORS; i += 1) {
    importSensors.push(Far(`import-${i}`, {}));
  }
  const { promise, resolve } = makePromiseKit();
  let dur;
  let retain;

  return Far('root', {
    bootstrap: async (vats, devices) => {
      vatAdmin = await E(vats.vatAdmin).createVatAdminService(devices.vatAdmin);
    },

    getMarker: () => marker,

    getImportSensors: () => importSensors,

    buildV1: async () => {
      // build Ulrik, the upgrading vat
      const bcap = await E(vatAdmin).getNamedBundleCap('ulrik1');
      const vatParameters = { youAre: 'v1', marker };
      const options = { vatParameters };
      const res = await E(vatAdmin).createVat(bcap, options);
      ulrikRoot = res.root;
      ulrikAdmin = res.adminNode;
      const version = await E(ulrikRoot).getVersion();
      const parameters = await E(ulrikRoot).getParameters();
      await E(ulrikRoot).acceptPresence(marker);
      const m2 = await E(ulrikRoot).getPresence();
      assert.equal(m2, marker);
      const data = await E(ulrikRoot).getData();

      retain = await E(ulrikRoot).getExports(importSensors);

      dur = await E(ulrikRoot).getDurandal({ d1: 'd1' });
      const d1arg = await E(dur).get();
      // poor man's deepEqual
      // (each enumerable own property as a [key, value] pair)
      assert.equal(JSON.stringify(Object.entries(d1arg)), '[["d1","d1"]]');

      // give version 1 a promise that won't be resolved until after upgrade
      await E(ulrikRoot).acceptPromise(promise);

      // get promises that never resolve (and will be rejected at upgrade)
      const [p1] = await E(ulrikRoot).getEternalPromiseInArray();
      p1.catch(() => 'hush');
      const p2 = E(ulrikRoot).getEternalPromise();
      p2.catch(() => 'hush');

      return { version, data, p1, p2, retain, ...parameters };
    },

    upgradeV2: async () => {
      const bcap = await E(vatAdmin).getNamedBundleCap('ulrik2');
      const vatParameters = { youAre: 'v2', marker };
      const upgradeMessage = 'test upgrade';
      const upgradeResult = await E(ulrikAdmin).restartVat(bcap, {
        vatParameters,
        upgradeMessage,
      });
      const version = await E(ulrikRoot).getVersion();
      const parameters = await E(ulrikRoot).getParameters();
      const m2 = await E(ulrikRoot).getPresence();
      assert.equal(m2, marker);
      const data = await E(ulrikRoot).getData();

      // marshal splats a bunch of log messages when it serializes
      // 'remoerr' at the end of this function, warn the human
      console.log(`note: expect one 'vat terminated' error logged below`);
      let remoerr; // = Error('foo');
      await E(retain.rem1)
        .get()
        .catch(err => (remoerr = err));

      const d1arg = await E(dur).get();
      assert.equal(d1arg.d1, 'd1'); // durable object still works
      assert.equal(d1arg.new, 'new'); // in the new way

      // the durables we retained should still be viable
      const doget = obj =>
        E(obj)
          .get()
          .then(res => res.name);
      assert.equal(await doget(retain.dur1), 'd1', 'retain.dur1 broken');

      const dc4entries = await E(ulrikRoot).getEntries(retain.dc4);
      assert.equal(dc4entries.length, 2);
      const dur28 = await E(retain.dc4).get(importSensors[28]);
      const imp28 = await E(dur28).getImport();
      assert.equal(imp28, importSensors[28], 'retain.dc4 broken');

      // the durables retained by the vat in baggage should still be viable
      const baggageImps = await E(ulrikRoot).checkBaggage(
        importSensors[32],
        importSensors[36],
      );
      const { imp33, imp35, imp37, imp38 } = baggageImps;
      assert.equal(imp33, importSensors[33]);
      assert.equal(imp35, importSensors[35]);
      assert.equal(imp37, importSensors[37]);
      assert.equal(imp38, importSensors[38]);

      // all Remotable and merely-virtual objects are gone
      await insistMissing(retain.vir2);
      await insistMissing(retain.vir5);
      await insistMissing(retain.vir7);
      await insistMissing(retain.vc1, true);
      await insistMissing(retain.vc3, true);
      await insistMissing(retain.rem1);
      await insistMissing(retain.rem2);
      await insistMissing(retain.rem3);

      resolve(`message for your predecessor, don't freak out`);

      const newDur = await E(ulrikRoot).getNewDurandal();

      return { version, data, remoerr, newDur, upgradeResult, ...parameters };
    },

    buildV1WithLostKind: async () => {
      const bcap = await E(vatAdmin).getNamedBundleCap('ulrik1');
      const events = [];
      const handler = Far('handler', { ping: msg => events.push(msg) });
      const vatParameters = { youAre: 'v1', marker };
      const options = { vatParameters };
      const res = await E(vatAdmin).createVat(bcap, options);
      ulrikRoot = res.root;
      ulrikAdmin = res.adminNode;
      await E(ulrikRoot).makeLostKind();
      await E(ulrikRoot).pingback(handler); // pushes 'ping 1' on events
      return events;
    },

    upgradeV2Simple: async mode => {
      const bcap = await E(vatAdmin).getNamedBundleCap('ulrik2');
      const vatParameters = { youAre: 'v2', marker, mode };
      await E(ulrikAdmin).restartVat(bcap, { vatParameters });
      return [];
    },

    upgradeV2WhichLosesKind: async () => {
      const bcap = await E(vatAdmin).getNamedBundleCap('ulrik2');
      const events = [];
      const handler = Far('handler', { ping: msg => events.push(msg) });
      await E(ulrikRoot).pingback(handler); // pushes 'ping 2' on events
      const vatParameters = { youAre: 'v2', marker, handler };
      // vp.handler causes v2 to handler~.ping(), but that gets unwound
      const p = E(ulrikAdmin).restartVat(bcap, { vatParameters }); // throws
      await p.catch(e => events.push(e)); // pushes upgrade Error on events
      await E(ulrikRoot).pingback(handler); // v1 pushes 'ping 3' on events
      return events;
    },

    buildV1WithPing: async () => {
      const bcap = await E(vatAdmin).getNamedBundleCap('ulrik1');
      const events = [];
      const handler = Far('handler', { ping: msg => events.push(msg) });
      const vatParameters = { youAre: 'v1', handler };
      const options = { vatParameters };
      const res = await E(vatAdmin).createVat(bcap, options);
      ulrikRoot = res.root;
      ulrikAdmin = res.adminNode;
      await E(ulrikRoot).pingback(handler); // goes to v1
      return events;
    },

    buildV1KindModeTest: async v1mode => {
      const bcap = await E(vatAdmin).getNamedBundleCap('ulrik1');
      const vatParameters = { youAre: 'v1', marker };
      const options = { vatParameters };
      const res = await E(vatAdmin).createVat(bcap, options);
      ulrikRoot = res.root;
      ulrikAdmin = res.adminNode;
      retain = await E(ulrikRoot).getExports(importSensors);
      ulrikRoot = res.root;
      ulrikAdmin = res.adminNode;
      if (v1mode === 'single') {
        await E(ulrikRoot).makeSingleKind();
      } else {
        await E(ulrikRoot).makeMultiKind();
      }
      return [];
    },

    upgradeV2KindModeTest: async v2mode => {
      const bcap = await E(vatAdmin).getNamedBundleCap('ulrik2');
      const vatParameters = { youAre: 'v2', marker, v2mode };
      await E(ulrikAdmin).restartVat(bcap, { vatParameters });
      return [];
    },

    upgradeV2WhichExplodes: async () => {
      const bcap = await E(vatAdmin).getNamedBundleCap('ulrik2');
      const events = [];
      const handler = Far('handler', { ping: msg => events.push(msg) });
      const explode = 'kaboom';
      const vatParameters = { youAre: 'v2', marker, handler, explode };
      // vp.handler causes v2 to handler~.ping(), but that gets unwound
      const p = E(ulrikAdmin).restartVat(bcap, { vatParameters }); // throws
      await p.catch(e => {
        events.push(e);
        events.push(e instanceof Error);
        events.push(/vat-upgrade failure/.test(e.message));
      });
      await E(ulrikRoot).pingback(handler); // goes to post-rewind v1
      return events;
    },

    doUpgradeWithBadOption: async () => {
      const bcap1 = await E(vatAdmin).getNamedBundleCap('ulrik1');
      const options1 = { vatParameters: { youAre: 'v1', marker } };
      const res = await E(vatAdmin).createVat(bcap1, options1);
      ulrikAdmin = res.adminNode;

      const bcap2 = await E(vatAdmin).getNamedBundleCap('ulrik2');
      const options2 = {
        vatParameters: { youAre: 'v2', marker },
        bad: 'unknown option',
      };
      await E(ulrikAdmin).restartVat(bcap2, options2); // throws
    },

    doUpgradeWithoutVatParameters: async () => {
      const bcap1 = await E(vatAdmin).getNamedBundleCap('ulrik1');
      const res = await E(vatAdmin).createVat(bcap1);
      ulrikAdmin = res.adminNode;
      const root = res.root;
      const paramA = await E(root).getParameters();

      const bcap2 = await E(vatAdmin).getNamedBundleCap('ulrik2');
      await E(ulrikAdmin).restartVat(bcap2); // no options
      const paramB = await E(root).getParameters();

      return [paramA, paramB];
    },
  });
};
