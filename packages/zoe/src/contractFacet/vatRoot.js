// @ts-check

// This is the Zoe contract facet. Each time we make a new instance of a
// contract we will start by creating a new vat and running this code in it. In
// order to install this code in a vat, Zoe needs to import a bundle containing
// this code. We will eventually have an automated process, but for now, every
// time this file is edited, the bundle must be manually rebuilt with
// `yarn build-zcfBundle`.

import { Far } from '@endo/marshal';

import '../../exported.js';
import '../internal-types.js';

import { makeZCFZygote } from './zcfZygote.js';

/**
 * @param {VatPowers} powers
 * @returns {{ executeContract: ExecuteContract }}
 */
export function buildRootObject(powers) {
  // Currently, there is only one function, `executeContract` called
  // by the Zoe Service. However, when there is kernel support for
  // zygote vats (essentially freezing and then creating copies of
  // vats), `makeZCFZygote`, `zcfZygote.evaluateContract` and
  // `zcfZygote.startContract` should exposed separately.
  // @ts-expect-error no TS defs for rickety test scaffolding
  const { testJigSetter } = powers;

  /** @type {ExecuteContract} */
  const executeContract = (
    bundleOrBundleCap,
    zoeService,
    invitationIssuer,
    zoeInstanceAdmin,
    instanceRecordFromZoe,
    issuerStorageFromZoe,
    privateArgs = undefined,
  ) => {
    /** @type {ZCFZygote} */
    const zcfZygote = makeZCFZygote(
      powers,
      zoeService,
      invitationIssuer,
      testJigSetter,
    );
    zcfZygote.evaluateContract(bundleOrBundleCap);
    return zcfZygote.startContract(
      zoeInstanceAdmin,
      instanceRecordFromZoe,
      issuerStorageFromZoe,
      privateArgs,
    );
  };

  return Far('executeContract', { executeContract });
}

harden(buildRootObject);
