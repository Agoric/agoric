// @ts-check

/**
 * Zoe uses ERTP, the Electronic Rights Transfer Protocol
 *
 * A note about ERTP AssetKinds: Within Zoe, the assetKind of validated amounts
 * must be consistent with the brand's assetKind. This is stricter than the
 * validation provided by AmountMath currently. When the brand has an assetKind
 * itself, AmountMath will validate that.
 */
import '@agoric/ertp/exported.js';
import '@agoric/store/exported.js';

import '../../exported.js';
import '../internal-types.js';

import { AssetKind } from '@agoric/ertp';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makePromiseKit } from '@endo/promise-kit';

import { makeZoeStorageManager } from './zoeStorageManager.js';
import { makeStartInstance } from './startInstance.js';
import { makeOfferMethod } from './offer/offer.js';
import { makeInvitationQueryFns } from './invitationQueries.js';
import { setupCreateZCFVat } from './createZCFVat.js';
import { createFeeMint } from './feeMint.js';

/**
 * Create an instance of Zoe.
 *
 * @param {VatAdminSvc} vatAdminSvc - The vatAdmin Service, which carries the
 *   power to create a new vat.
 * @param {ShutdownWithFailure} shutdownZoeVat - A function to shutdown the Zoe
 *   Vat. This function needs to use the vatPowers available to a vat.
 * @param {FeeIssuerConfig} feeIssuerConfig
 * @param {ZCFSpec} [zcfSpec] - Pointer to the contract facet bundle.
 * @returns {{
 *   zoeService: ZoeService;
 *   feeMintAccess: FeeMintAccess;
 * }}
 */
const makeZoeKit = (
  vatAdminSvc,
  shutdownZoeVat = () => {},
  feeIssuerConfig = {
    name: 'RUN',
    assetKind: AssetKind.NAT,
    displayInfo: harden({ decimalPlaces: 6, assetKind: AssetKind.NAT }),
  },
  zcfSpec = { name: 'zcf' },
) => {
  // We must pass the ZoeService to `makeStartInstance` before it is
  // defined. See below where the promise is resolved.
  /** @type {PromiseRecord<ZoeService>} */
  const zoeServicePromiseKit = makePromiseKit();

  const { feeMintAccess, getFeeIssuerKit, feeIssuer, feeBrand } = createFeeMint(
    feeIssuerConfig,
    shutdownZoeVat,
  );

  const getBundleCapFromID = bundleID => E(vatAdminSvc).getBundleCap(bundleID);

  // This method contains the power to create a new ZCF Vat, and must
  // be closely held. vatAdminSvc is even more powerful - any vat can
  // be created. We severely restrict access to vatAdminSvc for this reason.
  const createZCFVat = setupCreateZCFVat(vatAdminSvc, zcfSpec);

  // The ZoeStorageManager composes and consolidates capabilities
  // needed by Zoe according to POLA.
  const {
    depositPayments,
    getAssetKindByBrand,
    makeZoeInstanceStorageManager,
    installBundle,
    installBundleID,
    unwrapInstallation,
    getBundleIDFromInstallation,
    getPublicFacet,
    getBrands,
    getIssuers,
    getTerms,
    getInstallationForInstance,
    getInstanceAdmin,
    invitationIssuer,
  } = makeZoeStorageManager(
    createZCFVat,
    getBundleCapFromID,
    getFeeIssuerKit,
    shutdownZoeVat,
    feeIssuer,
    feeBrand,
  );

  // Pass the capabilities necessary to create E(zoe).startInstance
  const startInstance = makeStartInstance(
    zoeServicePromiseKit.promise,
    makeZoeInstanceStorageManager,
    unwrapInstallation,
  );

  // Pass the capabilities necessary to create E(zoe).offer
  const offer = makeOfferMethod(
    invitationIssuer,
    getInstanceAdmin,
    depositPayments,
    getAssetKindByBrand,
  );

  // Make the methods that allow users to easily and credibly get
  // information about their invitations.
  const { getInstance, getInstallation, getInvitationDetails } =
    makeInvitationQueryFns(invitationIssuer);

  const getConfiguration = () => {
    return harden({
      feeIssuerConfig,
    });
  };

  /** @type {ZoeService} */
  const zoeService = Far('zoeService', {
    install: installBundle,
    installBundleID,
    startInstance,
    offer,
    /** @deprecated Useless but provided during transition to keep old code from breaking. */
    makeFeePurse: async () => feeIssuer.makeEmptyPurse(),
    /**
     * @deprecated Useless but provided during transition to keep old code from breaking.
     * @param {ERef<Purse>} _defaultFeePurse
     */
    bindDefaultFeePurse: _defaultFeePurse => zoeService,
    getPublicFacet,

    // The functions below are getters only and have no impact on
    // state within Zoe
    getInvitationIssuer: async () => invitationIssuer,
    getFeeIssuer: async () => feeIssuer,
    getBrands,
    getIssuers,
    getTerms,
    getInstallationForInstance,
    getInstance,
    getInstallation,
    getInvitationDetails,
    getConfiguration,
    getBundleIDFromInstallation,
  });

  // startInstance must pass the ZoeService to the newly created ZCF
  // vat, but the zoeService is not yet defined when startInstance is
  // defined. So, we pass a promise and then resolve the promise here.
  zoeServicePromiseKit.resolve(zoeService);

  return harden({
    zoeService,
    feeMintAccess,
  });
};

export { makeZoeKit };
