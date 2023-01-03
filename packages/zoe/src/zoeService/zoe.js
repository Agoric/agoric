/**
 * Zoe uses ERTP, the Electronic Rights Transfer Protocol
 *
 * A note about ERTP AssetKinds: Within Zoe, the assetKind of
 * validated amounts must be consistent with the brand's assetKind.
 * This is stricter than the validation provided by AmountMath
 * currently. When the brand has an assetKind itself, AmountMath will
 * validate that.
 */
// Ambient types. https://github.com/Agoric/agoric-sdk/issues/6512
import '@agoric/ertp/exported.js';
import '@agoric/store/exported.js';
import '@agoric/vats/exported.js';

import '../internal-types.js';

import { E } from '@endo/eventual-send';
import { makeScalarBigMapStore, vivifyFarInstance } from '@agoric/vat-data';

import { makeZoeStorageManager } from './zoeStorageManager.js';
import { makeStartInstance } from './startInstance.js';
import { makeOfferMethod } from './offer/offer.js';
import { makeInvitationQueryFns } from './invitationQueries.js';
import { getZcfBundleCap } from './createZCFVat.js';
import { defaultFeeIssuerConfig, vivifyFeeMint } from './feeMint.js';
import { FeeMintAccessRetrieverI, ZoeServiceI } from '../typeGuards.js';

/** @typedef {import('@agoric/vat-data').Baggage} Baggage */

const { Fail } = assert;

/**
 * Create an instance of Zoe.
 *
 * @param {Promise<VatAdminSvc> | VatAdminSvc} [vatAdminSvcP] - The vatAdmin Service, which carries the
 * power to create a new vat. If it's not available when makeZoe() is called, it
 * must be provided later using setVatAdminService().
 * @param {ShutdownWithFailure} shutdownZoeVat - a function to
 * shutdown the Zoe Vat. This function needs to use the vatPowers
 * available to a vat.
 * @param {FeeIssuerConfig} feeIssuerConfig
 * @param {ZCFSpec} [zcfSpec] - Pointer to the contract facet bundle.
 * @param {Baggage} [zoeBaggage]
 */
const makeZoeKit = (
  vatAdminSvcP = undefined,
  shutdownZoeVat = () => {},
  feeIssuerConfig = defaultFeeIssuerConfig,
  zcfSpec = { name: 'zcf' },
  zoeBaggage = makeScalarBigMapStore('zoe baggage', { durable: true }),
) => {
  let zcfBundleCap;

  function saveBundleCap() {
    E.when(
      Promise.all([vatAdminSvcP, getZcfBundleCap(zcfSpec, vatAdminSvcP)]),
      ([vatAdminService, bundleCap]) => {
        zcfBundleCap = bundleCap;

        zoeBaggage.init('vatAdminSvc', vatAdminService);
        zoeBaggage.init('zcfBundleCap', zcfBundleCap);
      },
    );
  }

  const setVatAdminService = lateVatAdminSvc => {
    vatAdminSvcP = lateVatAdminSvc;
    saveBundleCap();
  };
  if (vatAdminSvcP) {
    saveBundleCap();
  } else if (zoeBaggage.has('zcfBundleCap')) {
    zcfBundleCap = zoeBaggage.get('zcfBundleCap');
    // in this case, it'll be known to have been resolved, but that's fine
    vatAdminSvcP = zoeBaggage.get('vatAdminSvc');
  }

  const feeMintKit = vivifyFeeMint(zoeBaggage, feeIssuerConfig, shutdownZoeVat);

  /** @type {GetBundleCapForID} */
  const getBundleCapForID = bundleID => {
    vatAdminSvcP || Fail`vatAdminSvc must be defined.`;
    // @ts-expect-error the guard protects it.
    return E(vatAdminSvcP).waitForBundleCap(bundleID);
  };

  // This method contains the power to create a new ZCF Vat, and must
  // be closely held. vatAdminSvc is even more powerful - any vat can
  // be created. We severely restrict access to vatAdminSvc for this reason.
  const createZCFVat = contractBundleCap => {
    assert(zcfBundleCap, `createZCFVat did not get bundleCap`);

    vatAdminSvcP || Fail`vatAdminSvc must be defined.`;
    // @ts-expect-error the guard protects it.
    return E(vatAdminSvcP).createVat(
      zcfBundleCap,
      harden({
        name: 'zcf',
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

  const getBundleCapByIdNow = id => {
    vatAdminSvcP || Fail`vatAdminSvc must be defined.`;
    // @ts-expect-error the guard protects it.
    return E(vatAdminSvcP).getBundleCap(id);
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

  /** @type {ZoeService} */
  const zoeService = vivifyFarInstance(zoeBaggage, 'ZoeService', ZoeServiceI, {
    install(bundleId) {
      return dataAccess.installBundle(bundleId);
    },
    installBundleID(bundleId) {
      return dataAccess.installBundleID(bundleId);
    },
    startInstance,
    offer,
    setOfferFilter(instance, filters) {
      dataAccess.setOfferFilter(instance, filters);
    },

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

  const feeMintAccessRetriever = vivifyFarInstance(
    zoeBaggage,
    'FeeMintAccessRetriever',
    FeeMintAccessRetrieverI,
    {
      /** @type {() => FeeMintAccess} */
      get() {
        // @ts-expect-error type cast
        return feeMintKit.feeMintAccess;
      },
    },
  );

  return harden({
    zoeServices: {
      zoeService,
      feeMintAccessRetriever,
    },
    setVatAdminService,
  });
};

export { makeZoeKit };
/**
 * @typedef {ReturnType<typeof makeZoeKit>} ZoeKit
 */
