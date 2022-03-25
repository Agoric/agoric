// @ts-check

import { assert, details as X, q } from '@agoric/assert';
import { assertKeywordName } from './cleanProposal.js';

const { ownKeys } = Reflect;

/**
 * The InstanceRecord stores the installation, customTerms, issuers, and brands
 * for a particular Zoe contract instance. The installation and customTerms are
 * never changed, but new issuers (and their matching brands) may be added by
 * the contract code. Thus, an InstanceRecord may be outdated at any particular
 * point. This file manages the creation and updating of an InstanceRecord and
 * returns functions for getting the latest data.
 */

/**
 * @callback GetInstanceRecord
 * @returns {InstanceRecord}
 */

/** @returns {InstanceRecordManager} */
export const makeInstanceRecordStorage = () => {
  let instanceRecord;

  const assertInstantiated = () =>
    assert(
      instanceRecord !== 'undefined',
      X`instanceRecord has not been instantiated`,
    );

  const addIssuerToInstanceRecord = (keyword, issuerRecord) => {
    assertInstantiated();
    instanceRecord = {
      ...instanceRecord,
      terms: {
        ...instanceRecord.terms,
        issuers: {
          ...instanceRecord.terms.issuers,
          [keyword]: issuerRecord.issuer,
        },
        brands: {
          ...instanceRecord.terms.brands,
          [keyword]: issuerRecord.brand,
        },
      },
    };
  };

  /** @type {GetInstanceRecord} */
  const getInstanceRecord = () => {
    assertInstantiated();
    return harden(instanceRecord);
  };
  const getTerms = () => {
    assertInstantiated();
    return instanceRecord.terms;
  };
  const getIssuers = () => {
    assertInstantiated();
    return instanceRecord.terms.issuers;
  };
  const getBrands = () => {
    assertInstantiated();
    return instanceRecord.terms.brands;
  };
  /** @type {InstanceRecordManagerGetInstallationForInstance} */
  const getInstallationForInstance = () => {
    assertInstantiated();
    return instanceRecord.installation;
  };

  const assertUniqueKeyword = keyword => {
    assertInstantiated();
    assertKeywordName(keyword);
    assert(
      !ownKeys(instanceRecord.terms.issuers).includes(keyword),
      X`keyword ${q(keyword)} must be unique`,
    );
  };

  const instantiate = startingInstanceRecord => {
    assert(
      instanceRecord === undefined,
      X`instanceRecord ${instanceRecord} can only be instantiated once`,
    );
    instanceRecord = startingInstanceRecord;
  };

  return harden({
    addIssuerToInstanceRecord,
    getInstanceRecord,
    getTerms,
    getInstallationForInstance,
    getIssuers,
    getBrands,
    assertUniqueKeyword,
    instantiate,
  });
};

/**
 * Put together the instance record
 *
 * @param {Installation} installation
 * @param {Instance} instance
 * @param {Object} customTerms
 * @param {IssuerKeywordRecord} issuers
 * @param {BrandKeywordRecord} brands
 * @returns {InstanceRecordManager}
 */
export const makeAndStoreInstanceRecord = (
  installation,
  instance,
  customTerms,
  issuers,
  brands,
) => {
  const instanceRecord = harden({
    installation,
    instance,
    terms: {
      ...customTerms,
      issuers,
      brands,
    },
  });

  const instanceRecordStorage = makeInstanceRecordStorage();
  instanceRecordStorage.instantiate(instanceRecord);
  return instanceRecordStorage;
};
