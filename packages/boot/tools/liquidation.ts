import { Fail } from '@agoric/assert';
import {
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
} from '@agoric/inter-protocol/src/proposals/econ-behaviors.js';
import {
  type AgoricNamesRemotes,
  makeAgoricNamesRemotesFromFakeStorage,
} from '@agoric/vats/tools/board-utils.js';
import { Offers } from '@agoric/inter-protocol/src/clientSupport.js';
import type { ExecutionContext } from 'ava';
import { type SwingsetTestKit, makeSwingsetTestKit } from './supports.js';
import {
  type GovernanceDriver,
  type PriceFeedDriver,
  type WalletFactoryDriver,
  makeGovernanceDriver,
  makePriceFeedDriver,
  makeWalletFactoryDriver,
} from './drivers.js';

export type LiquidationSetup = {
  vaults: {
    atom: number;
    ist: number;
    debt: number;
  }[];
  bids: (
    | {
        give: string;
        discount: number;
        price?: undefined;
      }
    | {
        give: string;
        price: number;
        discount?: undefined;
      }
  )[];
  price: {
    starting: number;
    trigger: number;
  };
  auction: {
    start: {
      collateral: number;
      debt: number;
    };
    end: {
      collateral: number;
      debt: number;
    };
  };
};

export const scale6 = x => BigInt(Math.round(x * 1_000_000));

const DebtLimitValue = scale6(100_000);

export const likePayouts = ({ Bid, Collateral }) => ({
  Collateral: {
    value: scale6(Collateral),
  },
  Bid: {
    value: scale6(Bid),
  },
});

export const makeLiquidationTestKit = async ({
  swingsetTestKit,
  agoricNamesRemotes,
  walletFactoryDriver,
  governanceDriver,
  t,
}: {
  swingsetTestKit: SwingsetTestKit;
  agoricNamesRemotes: AgoricNamesRemotes;
  walletFactoryDriver: WalletFactoryDriver;
  governanceDriver: GovernanceDriver;
  t: Pick<ExecutionContext, 'like'>;
}) => {
  const priceFeedDrivers = {} as Record<string, PriceFeedDriver>;

  console.timeLog('DefaultTestContext', 'priceFeedDriver');

  console.timeEnd('DefaultTestContext');

  const setupStartingState = async ({
    collateralBrandKey,
    managerIndex,
    price,
  }: {
    collateralBrandKey: string;
    managerIndex: number;
    price: number;
  }) => {
    const managerPath = `published.vaultFactory.managers.manager${managerIndex}`;
    const { advanceTimeBy, readLatest } = swingsetTestKit;

    await null;
    if (!priceFeedDrivers[collateralBrandKey]) {
      priceFeedDrivers[collateralBrandKey] = await makePriceFeedDriver(
        collateralBrandKey,
        agoricNamesRemotes,
        walletFactoryDriver,
        // TODO read from the config file
        [
          'agoric1krunjcqfrf7la48zrvdfeeqtls5r00ep68mzkr',
          'agoric19uscwxdac6cf6z7d5e26e0jm0lgwstc47cpll8',
          'agoric144rrhh4m09mh7aaffhm6xy223ym76gve2x7y78',
          'agoric19d6gnr9fyp6hev4tlrg87zjrzsd5gzr5qlfq2p',
          'agoric1n4fcxsnkxe4gj6e24naec99hzmc4pjfdccy5nj',
        ],
      );
    }

    // price feed logic treats zero time as "unset" so advance to nonzero
    await advanceTimeBy(1, 'seconds');

    await priceFeedDrivers[collateralBrandKey].setPrice(price);

    // raise the VaultFactory DebtLimit
    await governanceDriver.changeParams(
      agoricNamesRemotes.instance.VaultFactory,
      {
        DebtLimit: {
          brand: agoricNamesRemotes.brand.IST,
          value: DebtLimitValue,
        },
      },
      {
        paramPath: {
          key: {
            collateralBrand: agoricNamesRemotes.brand[collateralBrandKey],
          },
        },
      },
    );

    // raise the PSM MintLimit
    await governanceDriver.changeParams(
      agoricNamesRemotes.instance['psm-IST-USDC_axl'],
      {
        MintLimit: {
          brand: agoricNamesRemotes.brand.IST,
          value: DebtLimitValue, // reuse
        },
      },
    );

    // confirm Relevant Governance Parameter Assumptions
    t.like(readLatest(`${managerPath}.governance`), {
      current: {
        DebtLimit: { value: { value: DebtLimitValue } },
        InterestRate: {
          type: 'ratio',
          value: { numerator: { value: 1n }, denominator: { value: 100n } },
        },
        LiquidationMargin: {
          type: 'ratio',
          value: { numerator: { value: 150n }, denominator: { value: 100n } },
        },
        LiquidationPadding: {
          type: 'ratio',
          value: { numerator: { value: 25n }, denominator: { value: 100n } },
        },
        LiquidationPenalty: {
          type: 'ratio',
          value: { numerator: { value: 1n }, denominator: { value: 100n } },
        },
        MintFee: {
          type: 'ratio',
          value: { numerator: { value: 50n }, denominator: { value: 10_000n } },
        },
      },
    });
    t.like(readLatest('published.auction.governance'), {
      current: {
        AuctionStartDelay: { type: 'relativeTime', value: { relValue: 2n } },
        ClockStep: {
          type: 'relativeTime',
          value: { relValue: 3n * SECONDS_PER_MINUTE },
        },
        DiscountStep: { type: 'nat', value: 500n }, // 5%
        LowestRate: { type: 'nat', value: 6500n }, // 65%
        PriceLockPeriod: {
          type: 'relativeTime',
          value: { relValue: SECONDS_PER_HOUR / 2n },
        },
        StartFrequency: {
          type: 'relativeTime',
          value: { relValue: SECONDS_PER_HOUR },
        },
        StartingRate: { type: 'nat', value: 10500n }, // 105%
      },
    });
  };

  const check = {
    vaultNotification(
      managerIndex: number,
      vaultIndex: number,
      partial: Record<string, any>,
    ) {
      const { readLatest } = swingsetTestKit;

      const notification = readLatest(
        `published.vaultFactory.managers.manager${managerIndex}.vaults.vault${vaultIndex}`,
      );
      t.like(notification, partial);
    },
  };

  const setupVaults = async (
    collateralBrandKey: string,
    managerIndex: number,
    setup: LiquidationSetup,
    base: number = 0,
  ) => {
    await setupStartingState({
      collateralBrandKey,
      managerIndex,
      price: setup.price.starting,
    });

    const minter =
      await walletFactoryDriver.provideSmartWallet('agoric1minter');

    for (let i = 0; i < setup.vaults.length; i += 1) {
      const offerId = `open-${collateralBrandKey}-vault${base + i}`;
      await minter.executeOfferMaker(Offers.vaults.OpenVault, {
        offerId,
        collateralBrandKey,
        wantMinted: setup.vaults[i].ist,
        giveCollateral: setup.vaults[i].atom,
      });
      t.like(minter.getLatestUpdateRecord(), {
        updated: 'offerStatus',
        status: { id: offerId, numWantsSatisfied: 1 },
      });
    }

    // Verify starting balances
    for (let i = 0; i < setup.vaults.length; i += 1) {
      check.vaultNotification(managerIndex, i, {
        debtSnapshot: {
          debt: { value: scale6(setup.vaults[i].debt) },
        },
        locked: { value: scale6(setup.vaults[i].atom) },
        vaultState: 'active',
      });
    }
  };

  const placeBids = async (
    collateralBrandKey: string,
    buyerWalletAddress: string,
    setup: LiquidationSetup,
  ) => {
    const buyer =
      await walletFactoryDriver.provideSmartWallet(buyerWalletAddress);

    await buyer.sendOffer(
      Offers.psm.swap(
        agoricNamesRemotes,
        agoricNamesRemotes.instance['psm-IST-USDC_axl'],
        {
          offerId: `print-${collateralBrandKey}-ist`,
          wantMinted: 1_000,
          pair: ['IST', 'USDC_axl'],
        },
      ),
    );

    const maxBuy = `10000${collateralBrandKey}`;

    for (let i = 0; i < setup.bids.length; i += 1) {
      const offerId = `${collateralBrandKey}-bid${i + 1}`;
      // bids are long-lasting offers so we can't wait here for completion
      await buyer.sendOfferMaker(Offers.auction.Bid, {
        offerId,
        ...setup.bids[i],
        maxBuy,
      });
      t.like(
        swingsetTestKit.readLatest(`published.wallet.${buyerWalletAddress}`),
        {
          status: {
            id: offerId,
            result: 'Your bid has been accepted',
            payouts: undefined,
          },
        },
      );
    }
  };

  return {
    check,
    priceFeedDrivers,
    setupVaults,
    placeBids,
  };
};

export const makeLiquidationTestContext = async t => {
  const swingsetTestKit = await makeSwingsetTestKit(t.log, 'bundles/vaults');
  console.time('DefaultTestContext');

  const { runUtils, storage } = swingsetTestKit;
  console.timeLog('DefaultTestContext', 'swingsetTestKit');
  const { EV } = runUtils;

  // Wait for ATOM to make it into agoricNames
  await EV.vat('bootstrap').consumeItem('vaultFactoryKit');
  console.timeLog('DefaultTestContext', 'vaultFactoryKit');

  // has to be late enough for agoricNames data to have been published
  const agoricNamesRemotes: AgoricNamesRemotes =
    makeAgoricNamesRemotesFromFakeStorage(storage);
  const refreshAgoricNamesRemotes = () => {
    Object.assign(
      agoricNamesRemotes,
      makeAgoricNamesRemotesFromFakeStorage(storage),
    );
  };
  agoricNamesRemotes.brand.ATOM || Fail`ATOM missing from agoricNames`;
  console.timeLog('DefaultTestContext', 'agoricNamesRemotes');

  const walletFactoryDriver = await makeWalletFactoryDriver(
    runUtils,
    storage,
    agoricNamesRemotes,
  );
  console.timeLog('DefaultTestContext', 'walletFactoryDriver');

  const governanceDriver = await makeGovernanceDriver(
    swingsetTestKit,
    agoricNamesRemotes,
    walletFactoryDriver,
    // TODO read from the config file
    [
      'agoric1ldmtatp24qlllgxmrsjzcpe20fvlkp448zcuce',
      'agoric140dmkrz2e42ergjj7gyvejhzmjzurvqeq82ang',
      'agoric1w8wktaur4zf8qmmtn3n7x3r0jhsjkjntcm3u6h',
    ],
  );
  console.timeLog('DefaultTestContext', 'governanceDriver');

  const liquidationTestKit = await makeLiquidationTestKit({
    swingsetTestKit,
    agoricNamesRemotes,
    walletFactoryDriver,
    governanceDriver,
    t,
  });
  return {
    ...swingsetTestKit,
    ...liquidationTestKit,
    agoricNamesRemotes,
    refreshAgoricNamesRemotes,
    walletFactoryDriver,
    governanceDriver,
  };
};

export type LiquidationTestContext = Awaited<
  ReturnType<typeof makeLiquidationTestContext>
>;

const addSTARsCollateral = async (
  t: ExecutionContext<LiquidationTestContext>,
) => {
  const { controller, buildProposal } = t.context;

  t.log('building proposal');
  const proposal = await buildProposal(
    '@agoric/builders/scripts/inter-protocol/add-STARS.js',
  );

  for await (const bundle of proposal.bundles) {
    await controller.validateAndInstallBundle(bundle);
  }
  t.log('installed', proposal.bundles.length, 'bundles');

  t.log('launching proposal');
  const bridgeMessage = {
    type: 'CORE_EVAL',
    evals: proposal.evals,
  };
  t.log({ bridgeMessage });

  const { EV } = t.context.runUtils;
  /** @type {ERef<import('@agoric/vats/src/types.js').BridgeHandler>} */
  const coreEvalBridgeHandler = await EV.vat('bootstrap').consumeItem(
    'coreEvalBridgeHandler',
  );
  await EV(coreEvalBridgeHandler).fromBridge(bridgeMessage);

  t.context.refreshAgoricNamesRemotes();

  t.log('add-STARS proposal executed');
};

export const ensureVaultCollateral = async (
  collateralBrandKey: string,
  t: ExecutionContext<LiquidationTestContext>,
) => {
  // TODO: we'd like to have this work on any brand
  const SUPPORTED_BRANDS = ['ATOM', 'STARS'];

  if (!SUPPORTED_BRANDS.includes(collateralBrandKey)) {
    throw Error('Unsupported brand type');
  }

  if (collateralBrandKey === 'ATOM') {
    return;
  }

  if (collateralBrandKey === 'STARS') {
    // eslint-disable-next-line @jessie.js/safe-await-separator
    await addSTARsCollateral(t);
  }
};
