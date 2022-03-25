// @ts-check

import { assert } from '@agoric/assert';
import { E } from '@endo/eventual-send';
import { passStyleOf } from '@endo/marshal';

/**
 * @template T
 * @typedef {Object} PetnameManager
 * @property {(petname: Petname, object: T) => Promise<void>} rename
 * @property {(petname: Petname) => T} get
 * @property {() => [Petname, T][]} getAll
 * @property {(petname: Petname, object: T) => Promise<void>} add
 */

/**
 * @typedef {PetnameManager<Installation>} InstallationManager
 *
 * @typedef {PetnameManager<Instance>} InstanceManager
 *
 * @typedef {PetnameManager<Issuer>} IssuerManager
 */

/**
 * @param {ERef<IssuerManager>} issuerManager
 * @param {ERef<InstanceManager>} instanceManager
 * @param {ERef<ZoeService>} zoe
 * @param {ERef<Purse>} zoeInvitationPurse
 */
export const makeStartInstance = (
  issuerManager,
  instanceManager,
  zoe,
  zoeInvitationPurse,
) => {
  const makeIssuerKeywordRecord = issuerPetnameKeywordRecord => {
    return Object.fromEntries(
      Object.entries(issuerPetnameKeywordRecord).map(
        ([keyword, issuerPetname]) => {
          const issuerP = E(issuerManager).get(issuerPetname);
          return [keyword, issuerP];
        },
      ),
    );
  };

  const getIssuerKeywordRecord = (
    issuerKeywordRecord,
    issuerPetnameKeywordRecord,
  ) => {
    if (issuerKeywordRecord !== undefined) {
      return issuerKeywordRecord;
    }
    return makeIssuerKeywordRecord(issuerPetnameKeywordRecord);
  };

  /**
   * @template {Installation} I
   * @param {{
   *   instancePetname: Petname;
   *   installation: I;
   *   issuerKeywordRecord?: IssuerKeywordRecord;
   *   issuerPetnameKeywordRecord?: Record<Keyword, Petname>;
   *   terms?: Object;
   * }} config
   */
  const startInstance = async config => {
    const {
      instancePetname,
      installation,
      issuerKeywordRecord,
      issuerPetnameKeywordRecord,
      terms,
    } = config;

    console.log(`- Creating Contract Instance: ${instancePetname}`);

    const issuerKeywordRecordToUse = getIssuerKeywordRecord(
      issuerKeywordRecord,
      issuerPetnameKeywordRecord,
    );
    const startInstanceResult = await E(zoe).startInstance(
      installation,
      issuerKeywordRecordToUse,
      terms,
    );

    const {
      creatorFacet,
      publicFacet,
      instance,
      creatorInvitation,
      adminFacet,
    } = startInstanceResult;

    console.log(`-- Registering Contract Instance: ${instancePetname}`);
    await E(instanceManager).add(instancePetname, instance);

    if (passStyleOf(creatorInvitation) === 'remotable') {
      assert(
        creatorInvitation,
        `creatorInvitation must be defined to be deposited`,
      );
      console.log(`-- Adding Invitation for: ${instancePetname}`);
      const invitationAmount = await E(zoeInvitationPurse).deposit(
        creatorInvitation,
      );
      console.log(`- Created Contract Instance: ${instancePetname}`);

      const creatorInvitationDetails = invitationAmount.value[0];
      return {
        creatorFacet,
        publicFacet,
        instance,
        adminFacet,
        creatorInvitationDetails,
      };
    }
    console.log(`- Created Contract Instance: ${instancePetname}`);
    return startInstanceResult;
  };

  return startInstance;
};
