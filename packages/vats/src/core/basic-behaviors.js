// @ts-check
import { E, Far } from '@endo/far';
import { AssetKind } from '@agoric/ertp';

import { Nat } from '@agoric/nat';
import { makeNameHubKit } from '../nameHub.js';

import { feeIssuerConfig } from './utils.js';

// TODO/TECHDEBT: move to run-protocol?
const Tokens = harden({
  RUN: {
    name: 'RUN',
    denom: 'urun',
    proposedName: 'Agoric RUN currency',
    assetKind: AssetKind.NAT,
    displayInfo: { decimalPlaces: 6 },
  },
  BLD: {
    name: 'BLD',
    denom: 'ubld',
    proposedName: 'Agoric staking token',
    assetKind: AssetKind.NAT,
    displayInfo: { decimalPlaces: 6 },
  },
});

/**
 * In golang/cosmos/app/app.go, we define cosmosInitAction with type
 * AG_COSMOS_INIT, with the following shape.
 *
 * The urun supplyCoins value is taken from genesis, thereby authorizing the
 * minting an initial supply of RUN.
 */
// eslint-disable-next-line no-unused-vars
const bootMsgEx = {
  type: 'AG_COSMOS_INIT',
  chainID: 'agoric',
  storagePort: 1,
  supplyCoins: [
    { denom: 'provisionpass', amount: '100' },
    { denom: 'sendpacketpass', amount: '100' },
    { denom: 'ubld', amount: '1000000000000000' },
    { denom: 'urun', amount: '50000000000' },
  ],
  vbankPort: 3,
  vibcPort: 2,
};

/**
 * TODO: review behaviors carefully for powers that go out of scope, since we
 * may want/need them later.
 */

/** @param {BootstrapPowers} powers */
export const makeVatsFromBundles = ({
  vats,
  devices,
  produce: { vatAdminSvc, loadVat },
}) => {
  const svc = E(vats.vatAdmin).createVatAdminService(devices.vatAdmin);
  vatAdminSvc.resolve(svc);
  // TODO: getVat? do we need to memoize this by name?
  // TODO: rename loadVat to createVatByName?
  loadVat.resolve(bundleName => {
    console.info(`createVatByName(${bundleName})`);
    const root = E(svc)
      .createVatByName(bundleName)
      .then(r => r.root);
    return root;
  });
};
harden(makeVatsFromBundles);

/**
 * @param {BootstrapPowers & {
 *   consume: { loadVat: ERef<VatLoader<ZoeVat>> };
 * }} powers
 *
 * @typedef {ERef<ReturnType<import('../vat-zoe.js').buildRootObject>>} ZoeVat
 */
export const buildZoe = async ({
  consume: { vatAdminSvc, loadVat, client },
  produce: { zoe, feeMintAccess },
}) => {
  const zcfBundleName = 'zcf'; // should match config.bundles.zcf=
  const { zoeService, feeMintAccess: fma } = await E(
    E(loadVat)('zoe'),
  ).buildZoe(vatAdminSvc, feeIssuerConfig, zcfBundleName);

  zoe.resolve(zoeService);

  feeMintAccess.resolve(fma);
  return Promise.all([
    E(client).assignBundle([_addr => ({ zoe: zoeService })]),
  ]);
};
harden(buildZoe);

/**
 * TODO: rename this to getBoard?
 *
 * @param {BootstrapPowers & {
 *   consume: { loadVat: ERef<VatLoader<BoardVat>> };
 * }} powers
 *
 * @typedef {ERef<ReturnType<import('../vat-board.js').buildRootObject>>} BoardVat
 */
export const makeBoard = async ({
  consume: { loadVat, client },
  produce: {
    board: { resolve: resolveBoard },
  },
}) => {
  const board = E(E(loadVat)('board')).getBoard();
  resolveBoard(board);
  return E(client).assignBundle([_addr => ({ board })]);
};
harden(makeBoard);

/**
 * Make the agoricNames, namesByAddress name hierarchies.
 *
 * AgoricNames are well-known items such as the RUN issuer, available as
 * E(home.agoricNames).lookup('issuer', 'RUN')
 *
 * NamesByAddress is a NameHub for each provisioned client, available, for
 * example, as `E(home.namesByAddress).lookup('agoric1...')`. `depositFacet` as
 * in `E(home.namesByAddress).lookup('agoric1...', 'depositFacet')` is reserved
 * for use by the Agoric wallet. Each client is given `home.myAddressNameAdmin`,
 * which they can use to assign (update / reserve) any other names they choose.
 *
 * @param {BootstrapSpace} powers
 */
export const makeAddressNameHubs = async ({
  consume: { agoricNames: agoricNamesP, client },
  produce,
}) => {
  const agoricNames = await agoricNamesP;

  const { nameHub: namesByAddress, nameAdmin: namesByAddressAdmin } =
    makeNameHubKit();
  produce.namesByAddress.resolve(namesByAddress);
  produce.namesByAddressAdmin.resolve(namesByAddressAdmin);

  const perAddress = address => {
    // Create a name hub for this address.
    const { nameHub: myAddressNameHub, nameAdmin: rawMyAddressNameAdmin } =
      makeNameHubKit();

    /** @type {MyAddressNameAdmin} */
    const myAddressNameAdmin = Far('myAddressNameAdmin', {
      ...rawMyAddressNameAdmin,
      getMyAddress: () => address,
    });
    // reserve space for deposit facet
    myAddressNameAdmin.reserve('depositFacet');
    // Register it with the namesByAddress hub.
    namesByAddressAdmin.update(address, myAddressNameHub);
    return { agoricNames, namesByAddress, myAddressNameAdmin };
  };

  return E(client).assignBundle([perAddress]);
};
harden(makeAddressNameHubs);

/** @param {BootstrapSpace} powers */
export const makeClientBanks = async ({ consume: { client, bankManager } }) => {
  return E(client).assignBundle([
    address => ({ bank: E(bankManager).getBankForAddress(address) }),
  ]);
};
harden(makeClientBanks);

/**
 * Mint RUN genesis supply.
 *
 * @param {BootstrapPowers & {
 *   vatParameters: { argv: { bootMsg?: typeof bootMsgEx } };
 * }} powers
 */
export const mintInitialSupply = async ({
  vatParameters: {
    argv: { bootMsg },
  },
  consume: { centralSupplyBundle: bundleP, feeMintAccess: feeMintAccessP, zoe },
  produce: { initialSupply },
}) => {
  const [centralSupplyBundle, feeMintAccess] = await Promise.all([
    bundleP,
    feeMintAccessP,
  ]);

  const { supplyCoins = [] } = bootMsg || {};
  const centralBootstrapSupply = supplyCoins.find(
    ({ denom }) => denom === Tokens.RUN.denom,
  ) || { amount: '0' };
  const bootstrapPaymentValue = Nat(BigInt(centralBootstrapSupply.amount));

  /**
   * @type {Installation<
   *   import('../../../run-protocol/src/centralSupply.js').CentralSupplyContract
   * >}
   */
  // @ts-expect-error bundle types are borked
  const installation = E(zoe).install(centralSupplyBundle);
  const start = E(zoe).startInstance(
    installation,
    {},
    { bootstrapPaymentValue },
    { feeMintAccess },
  );
  const payment = await E(E.get(start).creatorFacet).getBootstrapPayment();
  // TODO: shut down the centralSupply contract, now that we have the payment?
  initialSupply.resolve(payment);
};
harden(mintInitialSupply);

/**
 * Add RUN (with initialSupply payment), BLD (with mint) to BankManager.
 *
 * @param {BootstrapSpace & {
 *   consume: { loadVat: ERef<VatLoader<BankVat>> };
 * }} powers
 */
export const addBankAssets = async ({
  consume: { initialSupply, bridgeManager, loadVat, zoe, mintHolderBundle },
  produce: { bankManager, bldIssuerKit },
  issuer: { produce: produceIssuer },
  brand: { produce: produceBrand },
}) => {
  const runIssuer = await E(zoe).getFeeIssuer();
  const [runBrand, payment] = await Promise.all([
    E(runIssuer).getBrand(),
    initialSupply,
  ]);
  const runKit = { issuer: runIssuer, brand: runBrand, payment };

  const bundle = await mintHolderBundle;
  const installation = E(zoe).install(bundle);

  /** @type {{ creatorFacet: ERef<Mint>; publicFacet: ERef<Issuer> }} */
  // @ts-expect-error cast
  const { creatorFacet: bldMint, publicFacet: bldIssuer } = E.get(
    E(zoe).startInstance(
      installation,
      harden({}),
      harden({
        keyword: Tokens.BLD.name,
        assetKind: AssetKind.NAT,
        displayInfo: Tokens.BLD.displayInfo,
      }),
    ),
  );
  const bldBrand = await E(bldIssuer).getBrand();
  const bldKit = { mint: bldMint, issuer: bldIssuer, brand: bldBrand };
  bldIssuerKit.resolve(bldKit);

  const bankMgr = E(E(loadVat)('bank')).makeBankManager(bridgeManager);
  bankManager.resolve(bankMgr);

  produceIssuer.BLD.resolve(bldKit.issuer);
  produceIssuer.RUN.resolve(runKit.issuer);
  produceBrand.BLD.resolve(bldKit.brand);
  produceBrand.RUN.resolve(runKit.brand);
  return Promise.all([
    E(bankMgr).addAsset(
      Tokens.BLD.denom,
      Tokens.BLD.name,
      Tokens.BLD.proposedName,
      bldKit, // with mint
    ),
    E(bankMgr).addAsset(
      Tokens.RUN.denom,
      Tokens.RUN.name,
      Tokens.RUN.proposedName,
      runKit, // without mint, with payment
    ),
  ]);
};
harden(addBankAssets);
