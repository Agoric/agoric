import { AmountMath, AssetKind } from '@agoric/ertp';
import { split, splitMany } from '@agoric/ertp/src/legacy-payment-helpers.js';
import {
  makeRatio,
  natSafeMath,
} from '@agoric/zoe/src/contractSupport/index.js';
import { E, Far } from '@endo/far';
import { Nat } from '@endo/nat';
import { notForProductionUse } from '@agoric/internal/src/magic-cookie-test-only.js';
import { Stake, Stable } from '@agoric/internal/src/tokens.js';

const { Fail, quote: q } = assert;
const { multiply, floorDivide } = natSafeMath;
const { entries, fromEntries, keys, values } = Object;

/** @type {Record<string, number>} */
export const DecimalPlaces = {
  [Stake.symbol]: Stake.displayInfo.decimalPlaces,
  [Stable.symbol]: Stable.displayInfo.decimalPlaces,
  ATOM: 6,
  WETH: 18,
  LINK: 18,
  DAI: 18,
  moola: 2,
  simolean: 0,
};

/** @type {Record<string, { proposedName: string; balance: bigint }>} */
const FaucetPurseDetail = {
  [Stake.symbol]: {
    proposedName: Stake.proposedName,
    balance: 5000n,
  },
  [Stable.symbol]: {
    proposedName: Stable.proposedName,
    balance: 53n,
  },
  LINK: { proposedName: 'Oracle fee', balance: 51n },
  // WAS: USDC, but that interacts poorly with loadgen
  // TODO: move connectFaucet from sim-behaviors to a coreProposal
  DAI: { proposedName: 'DAI', balance: 1_323n },
};

const PCT = 100n;
const BASIS = 10_000n;

/**
 * @param {bigint} frac
 * @param {number} exp
 */
const pad0 = (frac, exp) =>
  `${`${'0'.repeat(exp)}${frac}`.slice(-exp)}`.replace(/0+$/, '');

/** @param {bigint} whole */
const separators = whole => {
  const sep = '_';
  // ack: https://stackoverflow.com/a/45950572/7963, https://regex101.com/
  const revStr = s => s.split('').reverse().join('');
  const lohi = revStr(`${whole}`);
  const s = lohi.replace(/(?=\d{4})(\d{3})/g, (m, p1) => `${p1}${sep}`);
  return revStr(s);
};

/**
 * @param {bigint} n
 * @param {number} exp
 */
export const decimal = (n, exp) => {
  const unit = 10n ** BigInt(exp);
  const [whole, frac] = [n / unit, n % unit];
  return frac !== 0n
    ? `${separators(whole)}.${pad0(frac, exp)}`
    : `${separators(whole)}`;
};

export const showBrand = b =>
  `${b}`.replace(/.object Alleged: (.*) brand./, '$1');
export const showAmount = ({ brand, value }) => {
  const b = `${showBrand(brand)}`;
  b in DecimalPlaces || Fail`unknown brand name: ${q(b)}`;
  return `${decimal(value, DecimalPlaces[b])} ${b}`;
};

const defaultConfig = /** @type {const} */ ({
  collateralValue: 1_000_000n,
  initialMargin: [150n, PCT],
  liquidationMargin: [125n, PCT],
  liquidationPenalty: [10n, PCT],
  interestRate: [250n, BASIS],
  mintFee: [1n, BASIS],
});

/**
 * @typedef {readonly [bigint, bigint]} Rational
 * @type {Record<
 *   string,
 *   {
 *     config?: {
 *       collateralValue: bigint;
 *       initialMargin: Rational;
 *       liquidationMargin: Rational;
 *       liquidationPenalty: Rational;
 *       interestRate: Rational;
 *       mintFee: Rational;
 *       liquidationPadding?: Rational;
 *     };
 *     trades: { central: number; collateral: bigint }[];
 *   }
 * >}
 */
export const AMMDemoState = {
  // TODO: getRUN makes BLD obsolete here
  BLD: {
    config: {
      ...defaultConfig,
      collateralValue: 20_000_000n,
    },
    trades: [
      { central: 1.23, collateral: 1n },
      { central: 1.21, collateral: 1n },
      { central: 1.22, collateral: 1n },
    ],
  },

  /* We actually can IBC-transfer Atoms via Pegasus right now. */
  ATOM: {
    config: defaultConfig,
    trades: [
      { central: 33.28, collateral: 1n },
      { central: 34.61, collateral: 1n },
      { central: 37.83, collateral: 1n },
    ],
  },

  WETH: {
    config: defaultConfig,
    trades: [
      { central: 3286.01, collateral: 1n },
      { central: 3435.86, collateral: 1n },
      { central: 3443.21, collateral: 1n },
    ],
  },

  LINK: {
    config: defaultConfig,
    trades: [
      { central: 26.9, collateral: 1n },
      { central: 30.59, collateral: 1n },
      { central: 30.81, collateral: 1n },
    ],
  },

  DAI: {
    config: {
      ...defaultConfig,
      collateralValue: 10_000_000n,
    },
    trades: [{ central: 1, collateral: 1n }],
  },

  moola: {
    trades: [
      { central: 1, collateral: 1n },
      { central: 1.3, collateral: 1n },
      { central: 1.2, collateral: 1n },
      { central: 1.8, collateral: 1n },
      { central: 1.5, collateral: 1n },
    ],
  },

  simolean: {
    trades: [
      { central: 21.35, collateral: 1n },
      { central: 21.72, collateral: 1n },
      { central: 21.24, collateral: 1n },
    ],
  },
};

/** @param {number} f */
const run2places = f =>
  BigInt(Math.round(f * 100)) * 10n ** BigInt(DecimalPlaces[Stable.symbol] - 2);

/**
 * @param {bigint} value
 * @param {{
 *   centralSupplyInstall: ERef<Installation>;
 *   feeMintAccess: ERef<FeeMintAccess>;
 *   zoe: ERef<ZoeService>;
 * }} powers
 * @returns {Promise<Payment<'nat'>>}
 */
const mintRunPayment = async (
  value,
  { centralSupplyInstall, feeMintAccess: feeMintAccessP, zoe },
) => {
  notForProductionUse();
  const feeMintAccess = await feeMintAccessP;

  const { creatorFacet: ammSupplier } = await E(zoe).startInstance(
    centralSupplyInstall,
    {},
    { bootstrapPaymentValue: value },
    { feeMintAccess },
  );
  // TODO: stop the contract vat?
  return E(ammSupplier).getBootstrapPayment();
};

/**
 * @param {string} name
 * @param {MintsVat} mints
 */
const provideCoin = async (name, mints) => {
  return E(mints).provideIssuerKit(name, AssetKind.NAT, {
    decimalPlaces: DecimalPlaces[name],
  });
};

/**
 * @param {BootstrapSpace} powers TODO: sync this type with end-user docs?
 *
 * @typedef {{
 *   issuer: ERef<Issuer>;
 *   issuerPetname: string;
 *   payment: Payment;
 *   brand: Brand;
 *   pursePetname: string;
 * }} UserPaymentRecord
 */
export const connectFaucet = async ({
  consume: {
    bankManager,
    bldIssuerKit: bldP,
    client,
    feeMintAccess,
    loadVat,
    zoe,
  },
  installation: {
    consume: { centralSupply: centralSupplyInstall },
  },
  produce: { mints },
}) => {
  assert(mints);
  const vats = {
    mints: E(loadVat)('mints'),
  };
  mints.resolve(vats.mints);

  const bldIssuerKit = await bldP;
  const LOTS = 1_000_000_000_000n; // TODO: design this.
  let faucetRunSupply = await mintRunPayment(LOTS, {
    centralSupplyInstall,
    feeMintAccess,
    zoe,
  });
  const stableIssuer = await E(zoe).getFeeIssuer();
  const stableBrand = await E(stableIssuer).getBrand();
  const stableIssuerKit = {
    issuer: stableIssuer,
    brand: stableBrand,
    mint: {
      mintPayment: async amount => {
        // TODO: what happens if faucetRunSupply doesn't have enough
        // remaining?
        let fragment;
        [fragment, faucetRunSupply] = await split(
          E(stableIssuer).makeEmptyPurse(),
          faucetRunSupply,
          amount,
        );
        return fragment;
      },
    },
  };

  const makeFaucet = async address => {
    const bank = await E(bankManager).getBankForAddress(address);

    /** @type {UserPaymentRecord[][]} */
    const userPaymentRecords = await Promise.all(
      entries(FaucetPurseDetail).map(async ([issuerName, record]) => {
        /** @param {string} name */
        const provideIssuerKit = async name => {
          await null;
          switch (name) {
            case Stable.symbol:
              return stableIssuerKit;
            case Stake.symbol:
              return bldIssuerKit;
            default: {
              const { mint, issuer, brand } = await provideCoin(
                name,
                vats.mints,
              );
              return { issuer, brand, mint };
            }
          }
        };
        const { issuer, brand, mint } = await provideIssuerKit(issuerName);
        const unit = 10n ** BigInt(DecimalPlaces[issuerName]);
        const amount = AmountMath.make(brand, Nat(record.balance) * unit);
        notForProductionUse();
        const payment = await E(mint).mintPayment(amount);

        /** @type {UserPaymentRecord[]} */
        let toFaucet = [];
        // Use the bank layer for BLD, IST.
        if (issuerName === Stake.symbol || issuerName === Stable.symbol) {
          const purse = E(bank).getPurse(brand);
          await E(purse).deposit(payment);
        } else {
          toFaucet = [
            {
              issuer,
              brand,
              issuerPetname: issuerName,
              payment,
              pursePetname: record.proposedName,
            },
          ];
        }

        return toFaucet;
      }),
    );

    const faucetPaymentInfo = harden(userPaymentRecords.flat());

    const userFeePurse = await E(E(zoe).getFeeIssuer()).makeEmptyPurse();

    const faucet = Far('faucet', {
      /**
       * reap the spoils of our on-chain provisioning.
       *
       * @returns {Promise<UserPaymentRecord[]>}
       */
      tapFaucet: async () => faucetPaymentInfo,
      getFeePurse() {
        return userFeePurse;
      },
    });

    return faucet;
  };

  return E(client).assignBundle([address => ({ faucet: makeFaucet(address) })]);
};
harden(connectFaucet);

/**
 * Calculate how much RUN we need to fund the pools
 *
 * @param {typeof AMMDemoState} issuers
 */
export const ammPoolRunDeposits = issuers => {
  let ammTotal = 0n;
  const balanceEntries = entries(issuers)
    .filter(([_i, { config }]) => config) // skip RUN and fake issuers
    .map(([issuerName, record]) => {
      assert(record.config);
      assert(record.trades);

      /** @param {bigint} n */
      const inCollateral = n => n * 10n ** BigInt(DecimalPlaces[issuerName]);

      // The initial trade represents the fair value of RUN for collateral.
      const initialTrade = record.trades[0];
      // The collateralValue to be deposited is given, and we want to deposit
      // the same value of RUN in the pool. For instance, We're going to
      // deposit 2 * 10^13 BLD, and 10^6 build will trade for 28.9 * 10^6 RUN
      const poolBalance = floorDivide(
        multiply(
          inCollateral(record.config.collateralValue),
          run2places(initialTrade.central),
        ),
        inCollateral(initialTrade.collateral),
      );
      ammTotal += poolBalance;
      return /** @type {[string, bigint]} */ ([issuerName, poolBalance]);
    });
  return {
    ammTotal,
    balances: fromEntries(balanceEntries),
  };
};

/**
 * @param {Payment} bootstrapPayment
 * @param {Record<string, bigint>} balances
 * @param {{ issuer: ERef<Issuer>; brand: Brand }} central
 */
export const splitAllCentralPayments = async (
  bootstrapPayment,
  balances,
  central,
) => {
  const ammPoolAmounts = values(balances).map(b =>
    AmountMath.make(central.brand, b),
  );

  const allPayments = await splitMany(
    E(central.issuer).makeEmptyPurse(),
    bootstrapPayment,
    ammPoolAmounts,
  );

  const issuerMap = fromEntries(
    keys(balances).map((name, i) => [
      name,
      {
        payment: allPayments[i],
        amount: ammPoolAmounts[i],
      },
    ]),
  );

  return issuerMap;
};

/**
 * @param {string} issuerName
 * @param {(typeof AMMDemoState)['ATOM']} record
 * @param {Record<string, { issuer: ERef<Issuer>; brand: Brand }>} kits
 * @param {{ issuer: ERef<Issuer<'nat'>>; brand: Brand<'nat'> }} central
 */
export const poolRates = (issuerName, record, kits, central) => {
  /** @param {bigint} n */
  const inCollateral = n => n * 10n ** BigInt(DecimalPlaces[issuerName]);
  const config = record.config;
  assert(config);
  assert(record.trades);
  const initialPrice = record.trades[0];
  assert(initialPrice);
  const initialPriceNumerator = run2places(record.trades[0].central);

  /**
   * @param {Rational} r
   * @param {Brand} b
   */
  const toRatio = ([n, d], b) => makeRatio(n, b, d);
  const rates = {
    debtLimit: AmountMath.make(central.brand, 1_000_000_000n),
    initialPrice: makeRatio(
      initialPriceNumerator,
      central.brand,
      inCollateral(initialPrice.collateral),
      kits[issuerName].brand,
    ),
    initialMargin: toRatio(config.initialMargin, central.brand),
    liquidationMargin: toRatio(config.liquidationMargin, central.brand),
    liquidationPenalty: toRatio(config.liquidationPenalty, central.brand),
    interestRate: toRatio(config.interestRate, central.brand),
    mintFee: toRatio(config.mintFee, central.brand),
    // XXX not relevant to AMM pools but poolRates is also used for addVaultType
    liquidationPadding:
      config.liquidationPadding &&
      toRatio(config.liquidationPadding, central.brand),
  };
  return { rates, initialValue: inCollateral(config.collateralValue) };
};

/**
 * @param {import('@agoric/inter-protocol/src/proposals/econ-behaviors.js').EconomyBootstrapPowers & {
 *     consume: { mints };
 *   }} powers
 */
