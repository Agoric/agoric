// @jessie-check
/* eslint @typescript-eslint/no-floating-promises: "warn" */

/**
 * Zoe uses ERTP, the Electronic Rights Transfer Protocol
 *
 * A note about ERTP AssetKinds: Within Zoe, the assetKind of
 * validated amounts must be consistent with the brand's assetKind.
 * This is stricter than the validation provided by AmountMath
 * currently. When the brand has an assetKind itself, AmountMath will
 * validate that.
 */

/// <reference path="../internal-types.js" />

import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makeScalarBigMapStore, prepareExo } from '@agoric/vat-data';
import { M } from '@agoric/store';

import { makeZoeStorageManager } from './zoeStorageManager.js';
import { makeStartInstance } from './startInstance.js';
import { makeOfferMethod } from './offer/offer.js';
import { makeInvitationQueryFns } from './invitationQueries.js';
import { getZcfBundleCap } from './createZCFVat.js';
import { defaultFeeIssuerConfig, prepareFeeMint } from './feeMint.js';
import { ZoeServiceI } from '../typeGuards.js';

// XXX this file is the package index, so export types
// eslint-disable-next-line import/export -- just types
export * from '../types.js';
// eslint-disable-next-line import/export -- just types
export * from './types.js';
export * from '../contractFacet/types.js';
// eslint-disable-next-line import/export -- just types
export * from '../../tools/types.js';
export * from './utils.js';

/** @import {Baggage} from '@agoric/vat-data' */

const { Fail } = assert;

/**
 * Create a durable instance of Zoe.
 *
 * @param {object} options
 * @param {Baggage} options.zoeBaggage - the baggage for Zoe durability. Must be provided by caller
 * @param {Promise<VatAdminSvc> | VatAdminSvc} [options.vatAdminSvc] - The vatAdmin Service, which carries the
 * power to create a new vat. If it's not available when makeZoe() is called, it
 * must be provided later using setVatAdminService().
 * @param {import('@agoric/swingset-vat').ShutdownWithFailure} [options.shutdownZoeVat] - a function to
 * shutdown the Zoe Vat. This function needs to use the vatPowers
 * available to a vat.
 * @param {FeeIssuerConfig} [options.feeIssuerConfig]
 * @param {ZCFSpec} [options.zcfSpec] - Pointer to the contract facet bundle.
 */
const makeDurableZoeKit = ({
  zoeBaggage,
  vatAdminSvc,
  shutdownZoeVat = () => {},
  feeIssuerConfig = defaultFeeIssuerConfig,
  zcfSpec = { name: 'zcf' },
}) => {
  /** @type {BundleCap} */
  let zcfBundleCap;

  const saveBundleCap = () => {
    void E.when(
      Promise.all([vatAdminSvc, getZcfBundleCap(zcfSpec, vatAdminSvc)]),
      ([vatAdminService, bundleCap]) => {
        zcfBundleCap = bundleCap;

        if (!zoeBaggage.has('vatAdminSvc')) {
          zoeBaggage.init('vatAdminSvc', vatAdminService);
          zoeBaggage.init('zcfBundleCap', zcfBundleCap);
        } else {
          zoeBaggage.set('vatAdminSvc', vatAdminService);
          zoeBaggage.set('zcfBundleCap', zcfBundleCap);
        }
      },
    );
  };

  const setVatAdminService = Far('setVatAdminService', lateVatAdminSvc => {
    vatAdminSvc = lateVatAdminSvc;
    saveBundleCap();
  });

  if (vatAdminSvc) {
    saveBundleCap();
  } else if (zoeBaggage.has('zcfBundleCap')) {
    zcfBundleCap = zoeBaggage.get('zcfBundleCap');
    // in this case, it'll be known to have been resolved, but that's fine
    vatAdminSvc = zoeBaggage.get('vatAdminSvc');
  }

  const feeMintKit = prepareFeeMint(
    zoeBaggage,
    feeIssuerConfig,
    shutdownZoeVat,
  );

  // guarantee that vatAdminSvcP has been defined.
  const getActualVatAdminSvcP = () => {
    if (!vatAdminSvc) {
      throw Fail`createZCFVat did not get bundleCap`;
    }
    return vatAdminSvc;
  };

  /** @type {GetBundleCapForID} */
  const getBundleCapForID = bundleID => {
    return E(getActualVatAdminSvcP()).waitForBundleCap(bundleID);
  };

  const getBundleCapByIdNow = id => {
    return E(getActualVatAdminSvcP()).getBundleCap(id);
  };

  // This method contains the power to create a new ZCF Vat, and must
  // be closely held. vatAdminSvc is even more powerful - any vat can
  // be created. We severely restrict access to vatAdminSvc for this reason.
  const createZCFVat = (contractBundleCap, contractLabel) => {
    zcfBundleCap || Fail`createZCFVat did not get bundleCap`;
    const name =
      contractLabel &&
      typeof contractLabel === 'string' &&
      contractLabel.length > 0
        ? `zcf-${contractLabel}`
        : 'zcf';

    return E(getActualVatAdminSvcP()).createVat(
      zcfBundleCap,
      harden({
        name,
        vatParameters: {
          contractBundleCap,
          // eslint-disable-next-line no-use-before-define
          zoeService,
          // eslint-disable-next-line no-use-before-define
          invitationIssuer: invitationIssuerAccess.getInvitationIssuer(),
        },
      }),
    );
  };

  // The ZoeStorageManager composes and consolidates capabilities
  // needed by Zoe according to POLA.
  const {
    zoeServiceDataAccess: dataAccess,
    makeOfferAccess,
    startInstanceAccess,
    invitationIssuerAccess,
  } = makeZoeStorageManager(
    createZCFVat,
    getBundleCapForID,
    shutdownZoeVat,
    feeMintKit.feeMint,
    zoeBaggage,
  );

  // Pass the capabilities necessary to create E(zoe).startInstance
  const startInstance = makeStartInstance(
    startInstanceAccess,
    () => zcfBundleCap,
    getBundleCapByIdNow,
    zoeBaggage,
  );

  // Pass the capabilities necessary to create E(zoe).offer
  const offer = makeOfferMethod(makeOfferAccess);

  // Make the methods that allow users to easily and credibly get
  // information about their invitations.

  const invitationIssuer = invitationIssuerAccess.getInvitationIssuer();
  const { getInstance, getInstallation, getInvitationDetails } =
    makeInvitationQueryFns(invitationIssuer);

  const getConfiguration = () => {
    return harden({
      feeIssuerConfig,
    });
  };

  const ZoeConfigI = M.interface('ZoeConfigFacet', {
    updateZcfBundleId: M.call(M.string()).returns(),
  });

  const zoeConfigFacet = prepareExo(zoeBaggage, 'ZoeConfigFacet', ZoeConfigI, {
    updateZcfBundleId(bundleId) {
      void E.when(
        getZcfBundleCap({ id: bundleId }, vatAdminSvc),
        bundleCap => {
          zcfBundleCap = bundleCap;
          zoeBaggage.set('zcfBundleCap', zcfBundleCap);
        },
        e => {
          console.error('🚨 unable to update ZCF Bundle: ', e);
          throw e;
        },
      );
    },
  });

  /** @type {ZoeService} */
  const zoeService = prepareExo(zoeBaggage, 'ZoeService', ZoeServiceI, {
    install(bundleId, bundleLabel) {
      return dataAccess.installBundle(bundleId, bundleLabel);
    },
    installBundleID(bundleId, bundleLabel) {
      return dataAccess.installBundleID(bundleId, bundleLabel);
    },
    startInstance,
    offer,

    // The functions below are getters only and have no impact on
    // state within Zoe
    getOfferFilter(instance) {
      return dataAccess.getOfferFilter(instance);
    },
    async getInvitationIssuer() {
      return dataAccess.getInvitationIssuer();
    },
    async getFeeIssuer() {
      return feeMintKit.feeMint.getFeeIssuer();
    },

    getBrands(instance) {
      return dataAccess.getBrands(instance);
    },
    getIssuers(instance) {
      return dataAccess.getIssuers(instance);
    },
    getPublicFacet(instance) {
      return dataAccess.getPublicFacet(instance);
    },
    getTerms(instance) {
      return dataAccess.getTerms(instance);
    },
    getInstallationForInstance(instance) {
      return dataAccess.getInstallation(instance);
    },
    getBundleIDFromInstallation(installation) {
      return dataAccess.getBundleIDFromInstallation(installation);
    },
    getInstallation,

    getInstance(invitation) {
      return getInstance(invitation);
    },
    getConfiguration,
    getInvitationDetails,
    getProposalShapeForInvitation(invitation) {
      return dataAccess.getProposalShapeForInvitation(invitation);
    },
  });

  return harden({
    zoeService,
    zoeConfigFacet,
    /** @type {FeeMintAccess} */
    // @ts-expect-error cast
    feeMintAccess: feeMintKit.feeMintAccess,
    setVatAdminService,
  });
};

/**
 * @deprecated
 * Create an instance of Zoe.
 *
 * This will fail upgrades and should only be used in tests through the helper
 * `makeZoeKitForTest`.
 *
 * @param {Promise<VatAdminSvc> | VatAdminSvc} [vatAdminSvc] - The vatAdmin Service, which carries the
 * power to create a new vat. If it's not available when makeZoe() is called, it
 * must be provided later using setVatAdminService().
 * @param {import('@agoric/swingset-vat').ShutdownWithFailure} [shutdownZoeVat] - a function to
 * shutdown the Zoe Vat. This function needs to use the vatPowers
 * available to a vat.
 * @param {FeeIssuerConfig} [feeIssuerConfig]
 * @param {ZCFSpec} [zcfSpec] - Pointer to the contract facet bundle.
 */
const makeZoeKit = (vatAdminSvc, shutdownZoeVat, feeIssuerConfig, zcfSpec) =>
  makeDurableZoeKit({
    vatAdminSvc,
    shutdownZoeVat,
    feeIssuerConfig,
    zcfSpec,
    zoeBaggage: makeScalarBigMapStore('fake zoe baggage', { durable: true }),
  });
harden(makeZoeKit);

export { makeDurableZoeKit, makeZoeKit };

/**
 * @typedef {ReturnType<typeof makeDurableZoeKit>} ZoeKit
 */
