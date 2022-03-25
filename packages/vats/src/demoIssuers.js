// @ts-check
import { assert } from '@agoric/assert';
import { AmountMath, AssetKind } from '@agoric/ertp';
import * as Collect from '@agoric/run-protocol/src/collect.js';
import {
  natSafeMath,
  makeRatio,
} from '@agoric/zoe/src/contractSupport/index.js';
import { Nat } from '@endo/nat';
import { E, Far } from '@endo/far';

const { details: X, quote: q } = assert;
const { multiply, floorDivide } = natSafeMath;
const { entries, fromEntries, keys, values } = Object;

const CENTRAL_ISSUER_NAME = 'RUN';
const QUOTE_INTERVAL = 5n * 60n;

/** @type {Record<string, number>} */
export const DecimalPlaces = {
  BLD: 6,
  [CENTRAL_ISSUER_NAME]: 6,
  ATOM: 6,
  WETH: 18,
  LINK: 18,
  USDC: 18,
  moola: 2,
  simolean: 0,
};

/** @type {Record<string, { proposedName: string; balance: bigint }>} */
const FaucetPurseDetail = {
  BLD: { proposedName: 'Agoric staking token', balance: 5000n },
  [CENTRAL_ISSUER_NAME]: { proposedName: 'Agoric RUN currency', balance: 53n },
  LINK: { proposedName: 'Oracle fee', balance: 51n },
  USDC: { proposedName: 'USD Coin', balance: 1_323n },
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
  return `${decimal(value, DecimalPlaces[b])} ${b}`;
};

/**
 * @typedef {[bigint, bigint]} Rational
 * @type {Record<
 *   string,
 *   {
 *     config?: {
 *       collateralValue: bigint;
 *       initialMargin: Rational;
 *       liquidationMargin: Rational;
 *       interestRate: Rational;
 *       loanFee: Rational;
 *     };
 *     trades: { central: number; collateral: bigint }[];
 *   }
 * >}
 */
export const AMMDemoState = {
  // TODO: getRUN makes BLD obsolete here
  BLD: {
    config: {
      collateralValue: 20_000_000n,
      initialMargin: [150n, PCT],
      liquidationMargin: [125n, PCT],
      interestRate: [250n, BASIS],
      loanFee: [1n, BASIS],
    },
    trades: [
      { central: 1.23, collateral: 1n },
      { central: 1.21, collateral: 1n },
      { central: 1.22, collateral: 1n },
    ],
  },

  /* We actually can IBC-transfer Atoms via Pegasus right now. */
  ATOM: {
    config: {
      collateralValue: 1_000_000n,
      initialMargin: [150n, PCT],
      liquidationMargin: [125n, PCT],
      interestRate: [250n, BASIS],
      loanFee: [1n, BASIS],
    },
    trades: [
      { central: 33.28, collateral: 1n },
      { central: 34.61, collateral: 1n },
      { central: 37.83, collateral: 1n },
    ],
  },

  WETH: {
    config: {
      collateralValue: 1_000_000n,
      initialMargin: [150n, PCT],
      liquidationMargin: [125n, PCT],
      interestRate: [250n, BASIS],
      loanFee: [1n, BASIS],
    },
    trades: [
      { central: 3286.01, collateral: 1n },
      { central: 3435.86, collateral: 1n },
      { central: 3443.21, collateral: 1n },
    ],
  },

  LINK: {
    config: {
      collateralValue: 1_000_000n,
      initialMargin: [150n, PCT],
      liquidationMargin: [125n, PCT],
      interestRate: [250n, BASIS],
      loanFee: [1n, BASIS],
    },
    trades: [
      { central: 26.9, collateral: 1n },
      { central: 30.59, collateral: 1n },
      { central: 30.81, collateral: 1n },
    ],
  },

  USDC: {
    config: {
      collateralValue: 10_000_000n,
      initialMargin: [150n, PCT],
      liquidationMargin: [125n, PCT],
      interestRate: [250n, BASIS],
      loanFee: [1n, BASIS],
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
  BigInt(Math.round(f * 100)) *
  10n ** BigInt(DecimalPlaces[CENTRAL_ISSUER_NAME] - 2);

/**
 * @param {bigint} value
 * @param {{
 *   centralSupplyBundle: ERef<SourceBundle>;
 *   feeMintAccess: ERef<FeeMintAccess>;
 *   zoe: ERef<ZoeService>;
 * }} powers
 * @returns {Promise<Payment>}
 */
const mintRunPayment = async (
  value,
  { centralSupplyBundle: centralP, feeMintAccess: feeMintAccessP, zoe },
) => {
  /** @type {[SourceBundle, FeeMintAccess]} */
  const [centralSupplyBundle, feeMintAccess] = await Promise.all([
    centralP,
    feeMintAccessP,
  ]);

  const { creatorFacet: ammSupplier } = await E(zoe).startInstance(
    E(zoe).install(centralSupplyBundle),
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
 * @param {BootstrapSpace & { consume: { loadVat: VatLoader<MintsVat> } }} powers
 *   TODO: sync this type with end-user docs?
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
    centralSupplyBundle,
    client,
    feeMintAccess,
    loadVat,
    zoe,
  },
  produce: { mints },
}) => {
  const vats = {
    mints: E(loadVat)('mints'),
  };
  mints.resolve(vats.mints);

  const bldIssuerKit = await bldP;
  const LOTS = 1_000_000_000_000n; // TODO: design this.
  let faucetRunSupply = await mintRunPayment(LOTS, {
    centralSupplyBundle,
    feeMintAccess,
    zoe,
  });
  const runIssuer = await E(zoe).getFeeIssuer();
  const runBrand = await E(runIssuer).getBrand();
  const runIssuerKit = {
    issuer: runIssuer,
    brand: runBrand,
    mint: {
      mintPayment: async amount => {
        // TODO: what happens if faucetRunSupply doesn't have enough
        // remaining?
        let fragment;
        [fragment, faucetRunSupply] = await E(runIssuer).split(
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
          switch (name) {
            case CENTRAL_ISSUER_NAME:
              return runIssuerKit;
            case 'BLD':
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
        const payment = await E(mint).mintPayment(amount);

        /** @type {UserPaymentRecord[]} */
        let toFaucet = [];
        // Use the bank layer for BLD, RUN.
        if (['BLD', 'RUN'].includes(issuerName)) {
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

    const faucetPaymentInfo = userPaymentRecords.flat();

    const userFeePurse = await E(zoe).makeFeePurse();

    const faucet = Far('faucet', {
      /**
       * Reap the spoils of our on-chain provisioning.
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
 * Calculate how much RUN we need to fund the AMM pools
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

  const allPayments = await E(central.issuer).splitMany(
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
 * @param {typeof AMMDemoState['ATOM']} record
 * @param {Record<string, { issuer: ERef<Issuer>; brand: Brand }>} kits
 * @param {{ issuer: ERef<Issuer>; brand: Brand }} central
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
    initialPrice: makeRatio(
      initialPriceNumerator,
      central.brand,
      inCollateral(initialPrice.collateral),
      kits[issuerName].brand,
    ),
    initialMargin: toRatio(config.initialMargin, central.brand),
    liquidationMargin: toRatio(config.liquidationMargin, central.brand),
    interestRate: toRatio(config.interestRate, central.brand),
    loanFee: toRatio(config.loanFee, central.brand),
  };
  return { rates, initialValue: inCollateral(config.collateralValue) };
};

/**
 * @param {BootstrapPowers & {
 *   consume: { mints };
 * }} powers
 */
export const fundAMM = async ({
  consume: {
    bldIssuerKit,
    centralSupplyBundle,
    chainTimerService,
    feeMintAccess,
    mints,
    priceAuthorityVat,
    priceAuthorityAdmin,
    vaultFactoryCreator,
    zoe,
  },
  issuer: {
    consume: { RUN: centralIssuer },
  },
  brand: {
    consume: { RUN: centralBrand },
  },
  instance: {
    consume: { amm: ammInstance },
  },
}) => {
  const { ammTotal: ammDepositValue, balances } =
    ammPoolRunDeposits(AMMDemoState);

  const vats = { mints, priceAuthority: priceAuthorityVat };

  const kits = await Collect.allValues(
    Collect.mapValues(
      fromEntries(
        [CENTRAL_ISSUER_NAME, ...keys(AMMDemoState)].map(n => [n, n]),
      ),
      async issuerName => {
        switch (issuerName) {
          case CENTRAL_ISSUER_NAME: {
            const [issuer, brand] = await Promise.all([
              centralIssuer,
              centralBrand,
            ]);
            return { mint: undefined, issuer, brand };
          }
          case 'BLD':
            return bldIssuerKit;
          default:
            return provideCoin(issuerName, vats.mints);
        }
      },
    ),
  );
  const central = kits[CENTRAL_ISSUER_NAME];

  /** @type {[XYKAMMPublicFacet, TimerService]} */
  const [ammPublicFacet, timer] = await Promise.all([
    E(zoe).getPublicFacet(ammInstance),
    chainTimerService,
  ]);

  const ammBootstrapPayment = await mintRunPayment(ammDepositValue, {
    centralSupplyBundle,
    feeMintAccess,
    zoe,
  });

  async function addAllCollateral() {
    const issuerMap = await splitAllCentralPayments(
      ammBootstrapPayment,
      balances,
      central,
    );

    return Promise.all(
      entries(AMMDemoState).map(async ([issuerName, record]) => {
        if (!record.config) {
          return undefined;
        }
        const { rates, initialValue } = poolRates(
          issuerName,
          record,
          kits,
          central,
        );

        const kit = kits[issuerName];
        assert(kit.mint, X`no mint for ${q(issuerName)}`);
        // @@ doesn't work for BLD?
        const secondaryPayment = await E(kit.mint).mintPayment(
          AmountMath.make(kit.brand, initialValue),
        );
        assert(secondaryPayment, X`no payment for ${q(issuerName)}`);

        assert(kit.issuer, `No issuer for ${issuerName}`);
        const liquidityIssuer = E(ammPublicFacet).addPool(
          // @ts-expect-error TODO: addPool should take ERef<Issuer>
          kit.issuer,
          issuerName,
        );
        const [secondaryAmount, liquidityBrand] = await Promise.all([
          // Error: (an undefined) was not a live payment for brand
          //  at (.../vats/src/demoIssuers.js:591)
          E(kit.issuer).getAmountOf(secondaryPayment),
          E(liquidityIssuer).getBrand(),
        ]);
        const centralAmount = issuerMap[issuerName].amount;
        const proposal = harden({
          want: { Liquidity: AmountMath.makeEmpty(liquidityBrand) },
          give: { Secondary: secondaryAmount, Central: centralAmount },
        });

        E(zoe).offer(
          E(ammPublicFacet).makeAddLiquidityInvitation(),
          proposal,
          harden({
            Secondary: secondaryPayment,
            Central: issuerMap[issuerName].payment,
          }),
        );

        const issuerPresence = await kit.issuer;
        return E(vaultFactoryCreator).addVaultType(
          issuerPresence,
          issuerName,
          rates,
        );
      }),
    );
  }

  /**
   * @param {ERef<Issuer>} issuerIn
   * @param {ERef<Issuer>} issuerOut
   * @param {ERef<Brand>} brandIn
   * @param {ERef<Brand>} brandOut
   * @param {[bigint | number, bigint | number][]} tradeList
   */
  const makeFakePriceAuthority = (
    issuerIn,
    issuerOut,
    brandIn,
    brandOut,
    tradeList,
  ) =>
    E(vats.priceAuthority).makeFakePriceAuthority({
      issuerIn,
      issuerOut,
      actualBrandIn: brandIn,
      actualBrandOut: brandOut,
      tradeList,
      timer,
      quoteInterval: QUOTE_INTERVAL,
    });

  await addAllCollateral();

  const brandsWithPriceAuthorities = await E(ammPublicFacet).getAllPoolBrands();

  await Promise.all(
    // TODO: exactly what is the list of things to iterate here?
    entries(AMMDemoState).map(async ([issuerName, record]) => {
      // Create priceAuthority pairs for centralIssuer based on the
      // AMM or FakePriceAuthority.
      console.debug(`Creating ${issuerName}-${CENTRAL_ISSUER_NAME}`);
      const issuer = kits[issuerName].issuer;
      const { trades } = record;
      /** @param {bigint} n */
      const inCollateral = n => n * 10n ** BigInt(DecimalPlaces[issuerName]);
      const tradesGivenCentral = trades.map(
        ({ central: num, collateral: unit }) =>
          /** @type {[bigint, bigint]} */ ([
            run2places(num),
            inCollateral(unit),
          ]),
      );
      assert(issuer);
      const brand = await E(issuer).getBrand();
      let toCentral;
      let fromCentral;

      if (brandsWithPriceAuthorities.includes(brand)) {
        ({ toCentral, fromCentral } = await E(ammPublicFacet)
          .getPriceAuthorities(brand)
          .catch(_e => {
            // console.warn('could not get AMM priceAuthorities', _e);
            return { toCentral: undefined, fromCentral: undefined };
          }));
      }

      if (!fromCentral && tradesGivenCentral) {
        // We have no amm from-central price authority, make one from trades.
        if (issuerName !== CENTRAL_ISSUER_NAME) {
          console.log(
            `Making fake price authority for ${CENTRAL_ISSUER_NAME}-${issuerName}`,
          );
        }
        fromCentral = makeFakePriceAuthority(
          central.issuer,
          issuer,
          central.brand,
          brand,
          tradesGivenCentral,
        );
      }

      if (!toCentral && central.issuer !== issuer && tradesGivenCentral) {
        // We have no amm to-central price authority, make one from trades.
        console.log(
          `Making fake price authority for ${issuerName}-${CENTRAL_ISSUER_NAME}`,
        );
        /** @type {[bigint | number, bigint | number][]} */
        const tradesGivenOther = tradesGivenCentral.map(
          ([valueCentral, valueOther]) => [valueOther, valueCentral],
        );
        toCentral = makeFakePriceAuthority(
          issuer,
          central.issuer,
          brand,
          central.brand,
          tradesGivenOther,
        );
      }

      // Register the price pairs.
      await Promise.all(
        [
          { pa: fromCentral, fromBrand: central.brand, toBrand: brand },
          { pa: toCentral, fromBrand: brand, toBrand: central.brand },
        ].map(async ({ pa, fromBrand, toBrand }) => {
          const paPresence = await pa;
          if (!paPresence) {
            return;
          }
          await E(priceAuthorityAdmin).registerPriceAuthority(
            paPresence,
            fromBrand,
            toBrand,
          );
        }),
      );
    }),
  );
};
