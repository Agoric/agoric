import { E } from '@endo/eventual-send';
import { passStyleOf, Remotable } from '@endo/marshal';
import { AssetKind } from '@agoric/ertp';
import { makePromiseKit } from '@endo/promise-kit';
import { assertPattern, mustMatch } from '@agoric/store';
import {
  canBeDurable,
  M,
  makeScalarBigMapStore,
  provideDurableMapStore,
  prepareExo,
  prepareExoClass,
} from '@agoric/vat-data';

import { objectMap } from '@agoric/internal';
import { cleanProposal } from '../cleanProposal.js';
import { evalContractBundle } from './evalContractCode.js';
import { makeMakeExiter } from './exit.js';
import { defineDurableHandle } from '../makeHandle.js';
import { provideIssuerStorage } from '../issuerStorage.js';
import { createSeatManager } from './zcfSeat.js';
import { makeInstanceRecordStorage } from '../instanceRecordStorage.js';
import { handlePKitWarning } from '../handleWarning.js';
import { makeOfferHandlerStorage } from './offerHandlerStorage.js';
import { makeZCFMintFactory } from './zcfMint.js';

import '../internal-types.js';
import './internal-types.js';

import '@agoric/swingset-vat/src/types-ambient.js';
import { HandleOfferI, InvitationHandleShape } from '../typeGuards.js';

/** @typedef {import('@agoric/ertp').IssuerOptionsRecord} IssuerOptionsRecord */

const { Fail } = assert;

/**
 * Make the ZCF vat in zygote-usable form. First, a generic ZCF is
 * made, then the contract code is evaluated, then a particular
 * instance is made.
 *
 * @param {VatPowers} powers
 * @param {ERef<ZoeService>} zoeService
 * @param {Issuer<'copyBag'>} invitationIssuer
 * @param {TestJigSetter} testJigSetter
 * @param {BundleCap} contractBundleCap
 * @param {import('@agoric/vat-data').Baggage} zcfBaggage
 * @returns {Promise<ZCFZygote>}
 */
export const makeZCFZygote = async (
  powers,
  zoeService,
  invitationIssuer,
  testJigSetter,
  contractBundleCap,
  zcfBaggage = makeScalarBigMapStore('zcfBaggage', { durable: true }),
) => {
  const makeSeatHandle = defineDurableHandle(zcfBaggage, 'Seat');
  /** @type {ERef<ZoeInstanceAdmin>} */
  let zoeInstanceAdmin;
  let seatManager;
  let instanceRecHolder;
  const makeExiter = makeMakeExiter(zcfBaggage);

  /** @type {() => InstanceState} */
  const getInstanceRecHolder = () => {
    instanceRecHolder || Fail`instanceRecord must be initialized before use.`;
    return instanceRecHolder;
  };

  const {
    storeIssuerRecord,
    getAssetKindByBrand,
    getBrandForIssuer,
    getIssuerForBrand,
    instantiate: instantiateIssuerStorage,
  } = provideIssuerStorage(zcfBaggage);

  /** @type {ShutdownWithFailure} */
  const shutdownWithFailure = reason => {
    E(zoeInstanceAdmin).failAllSeats(reason);
    seatManager.dropAllReferences();
    // https://github.com/Agoric/agoric-sdk/issues/3239
    powers.exitVatWithFailure(reason);
  };

  const { storeOfferHandler, takeOfferHandler } =
    makeOfferHandlerStorage(zcfBaggage);

  // Make the instanceRecord
  const makeInstanceRecord = makeInstanceRecordStorage(zcfBaggage);

  const recordIssuer = (
    /** @type {string} */ keyword,
    /** @type {IssuerRecord} */ issuerRecord,
  ) => {
    getInstanceRecHolder().addIssuer(keyword, issuerRecord);
    storeIssuerRecord(issuerRecord);
  };

  const makeEmptySeatKit = (exit = undefined) => {
    const initialAllocation = harden({});
    const proposal = cleanProposal(harden({ exit }), getAssetKindByBrand);
    const userSeatPromiseKit = makePromiseKit();
    handlePKitWarning(userSeatPromiseKit);
    const seatHandle = makeSeatHandle();

    const seatData = harden({
      proposal,
      initialAllocation,
      seatHandle,
    });
    const zcfSeat = seatManager.makeZCFSeat(seatData);

    const exiter = makeExiter(seatData.proposal, zcfSeat);
    E(zoeInstanceAdmin)
      .makeNoEscrowSeat(initialAllocation, proposal, exiter, seatHandle)
      .then(userSeat => userSeatPromiseKit.resolve(userSeat));

    return { zcfSeat, userSeat: userSeatPromiseKit.promise };
  };

  let zcfMintFactory;

  /**
   * @template {AssetKind} [K='nat']
   * @param {Keyword} keyword
   * @param {K} [assetKind]
   * @param {AdditionalDisplayInfo} [displayInfo]
   * @param {IssuerOptionsRecord} [options]
   * @returns {Promise<ZCFMint<K>>}
   */
  const makeZCFMint = async (
    keyword,
    // @ts-expect-error possible different subtype
    assetKind = AssetKind.NAT,
    displayInfo = undefined,
    options = undefined,
  ) => {
    getInstanceRecHolder().assertUniqueKeyword(keyword);

    const zoeMint = await E(zoeInstanceAdmin).makeZoeMint(
      keyword,
      assetKind,
      displayInfo,
      options,
    );
    return zcfMintFactory.makeZCFMintInternal(keyword, zoeMint);
  };

  /** @type {ZCFRegisterFeeMint} */
  const registerFeeMint = async (keyword, feeMintAccess) => {
    getInstanceRecHolder().assertUniqueKeyword(keyword);

    const zoeMint = await E(zoeInstanceAdmin).registerFeeMint(
      keyword,
      feeMintAccess,
    );
    return zcfMintFactory.makeZCFMintInternal(keyword, zoeMint);
  };

  const HandleOfferShape = M.remotable('HandleOffer');

  // handleOfferObject gives Zoe the ability to notify ZCF when a new seat is
  // added in offer(). ZCF responds with the exitObj and offerResult.
  const makeHandleOfferObj = prepareExoClass(
    zcfBaggage,
    'handleOfferObj',
    HandleOfferI,
    offerHandlerTaker => ({ offerHandlerTaker }),
    {
      handleOffer(invitationHandle, seatData) {
        const { state } = this;
        const zcfSeat = seatManager.makeZCFSeat(seatData);
        // TODO: provide a details that's a better diagnostic for the
        // ephemeral offerHandler that did not survive upgrade.

        const offerHandler = state.offerHandlerTaker.take(invitationHandle);
        const offerResultP =
          typeof offerHandler === 'function'
            ? E(offerHandler)(zcfSeat, seatData.offerArgs)
            : E(offerHandler).handle(zcfSeat, seatData.offerArgs);

        const offerResultPromise = offerResultP.catch(reason => {
          if (reason === undefined) {
            const newErr = new Error(
              `If an offerHandler throws, it must provide a reason of type Error, but the reason was undefined. Please fix the contract code to specify a reason for throwing.`,
            );
            throw zcfSeat.fail(newErr);
          }
          throw zcfSeat.fail(reason);
        });
        const exiter = makeExiter(seatData.proposal, zcfSeat);
        /** @type {HandleOfferResult} */
        return harden({ offerResultPromise, exitObj: exiter });
      },
    },
  );

  const HandleOfferFunctionShape = M.remotable('HandleOfferFunction');
  const OfferHandlerShape = M.or(HandleOfferShape, HandleOfferFunctionShape);
  const TakerI = M.interface('offer handler taker', {
    take: M.call(InvitationHandleShape)
      .optional(M.string())
      .returns(OfferHandlerShape),
  });
  const taker = prepareExo(zcfBaggage, 'offer handler taker', TakerI, {
    take: takeOfferHandler,
  });
  const handleOfferObj = makeHandleOfferObj(taker);

  const evaluateContract = () => {
    let bundle;
    if (passStyleOf(contractBundleCap) === 'remotable') {
      const bundleCap = contractBundleCap;
      // @ts-expect-error vatPowers is not typed correctly: https://github.com/Agoric/agoric-sdk/issues/3239
      bundle = powers.D(bundleCap).getBundle();
    } else {
      bundle = contractBundleCap;
    }
    return evalContractBundle(bundle);
  };
  // evaluate the contract (either the first version, or an upgrade)
  const {
    start,
    buildRootObject,
    privateArgsShape,
    customTermsShape,
    prepare,
  } = await evaluateContract();

  if (start === undefined && prepare === undefined) {
    buildRootObject === undefined ||
      Fail`Did you provide a vat bundle instead of a contract bundle?`;
    Fail`contract exports missing start/prepare`;
  }
  !start ||
    !prepare ||
    Fail`contract must provide exactly one of "start" and "prepare"`;

  /** @type {ZCF} */
  // Using Remotable rather than Far because there are too many complications
  // imposing checking wrappers: makeInvitation() and setJig() want to
  // accept raw functions. assert cannot be a valid passable! (It's a function
  // and has members.)
  const zcf = Remotable('Alleged: zcf', undefined, {
    reallocate: (...seats) => seatManager.reallocate(...seats),
    assertUniqueKeyword: kwd => getInstanceRecHolder().assertUniqueKeyword(kwd),
    saveIssuer: async (issuerP, keyword) => {
      // TODO: The checks of the keyword for uniqueness are
      // duplicated. Assess how waiting on promises to resolve might
      // affect those checks and see if one can be removed.
      getInstanceRecHolder().assertUniqueKeyword(keyword);
      const record = await E(zoeInstanceAdmin).saveIssuer(issuerP, keyword);
      // AWAIT ///
      recordIssuer(keyword, record);
      return record;
    },
    makeInvitation: (
      offerHandler,
      description,
      customDetails = harden({}),
      proposalShape = undefined,
    ) => {
      typeof description === 'string' ||
        Fail`invitations must have a description string: ${description}`;

      offerHandler || Fail`offerHandler must be provided`;

      if (proposalShape !== undefined) {
        assertPattern(proposalShape);
      }

      const invitationHandle = storeOfferHandler(offerHandler);
      const invitationP = E(zoeInstanceAdmin).makeInvitation(
        invitationHandle,
        description,
        customDetails,
        proposalShape,
      );
      return invitationP;
    },
    // Shutdown the entire vat and give payouts
    shutdown: completion => {
      E(zoeInstanceAdmin).exitAllSeats(completion);
      seatManager.dropAllReferences();
      powers.exitVat(completion);
    },
    shutdownWithFailure,
    stopAcceptingOffers: () => E(zoeInstanceAdmin).stopAcceptingOffers(),
    makeZCFMint,
    registerFeeMint,
    makeEmptySeatKit,

    // The methods below are pure and have no side-effects //
    getZoeService: () => zoeService,
    getInvitationIssuer: () => invitationIssuer,
    getTerms: () => {
      const terms = getInstanceRecHolder().getTerms();

      // If the contract provided customTermsShape, validate the customTerms.
      if (customTermsShape) {
        const { brands: _b, issuers: _i, ...customTerms } = terms;
        mustMatch(harden(customTerms), customTermsShape, 'customTerms');
      }

      return terms;
    },
    getBrandForIssuer,
    getIssuerForBrand,
    getAssetKind: getAssetKindByBrand,
    /** @type {SetTestJig} */
    setTestJig: (testFn = () => ({})) => {
      if (testJigSetter) {
        testJigSetter({ ...testFn(), zcf });
      }
    },
    getInstance: () => getInstanceRecHolder().getInstanceRecord().instance,
    setOfferFilter: strings => E(zoeInstanceAdmin).setOfferFilter(strings),
    getOfferFilter: () => E(zoeInstanceAdmin).getOfferFilter(),
  });

  // snapshot zygote here //////////////////
  // the zygote object below will be created now, but its methods won't be
  // invoked until after the snapshot is taken.

  const contractBaggage = provideDurableMapStore(zcfBaggage, 'contractBaggage');

  const initSeatMgrAndMintFactory = async () => {
    let zcfMintReallocator;
    ({ seatManager, zcfMintReallocator } = createSeatManager(
      zoeInstanceAdmin,
      getAssetKindByBrand,
      shutdownWithFailure,
      zcfBaggage,
    ));

    zcfMintFactory = makeZCFMintFactory(
      zcfBaggage,
      recordIssuer,
      getAssetKindByBrand,
      makeEmptySeatKit,
      zcfMintReallocator,
    );
  };

  /**
   * A zygote is a pre-image of a vat that can quickly be instantiated because
   * the code has already been evaluated. SwingSet doesn't support zygotes yet.
   * Once it does the code will be evaluated once when creating the zcfZygote,
   * then the start() function will be called each time an instance is started.
   *
   * Currently, Zoe's buildRootObject calls makeZCFZygote, evaluateContract, and
   * startContract every time a contract instance is created.
   *
   * @type {ZCFZygote}
   */
  const zcfZygote = {
    // wire zcf up to zoe instance-specific interfaces
    startContract: async (
      instanceAdminFromZoe,
      instanceRecordFromZoe,
      issuerStorageFromZoe,
      privateArgs = undefined,
    ) => {
      zoeInstanceAdmin = instanceAdminFromZoe;
      await initSeatMgrAndMintFactory();

      zcfBaggage.init('zcfInstanceAdmin', instanceAdminFromZoe);
      instanceRecHolder = makeInstanceRecord(instanceRecordFromZoe);
      instantiateIssuerStorage(issuerStorageFromZoe);
      zcfBaggage.init('instanceRecHolder', instanceRecHolder);

      const startFn = start || prepare;
      if (privateArgsShape) {
        mustMatch(privateArgs, privateArgsShape, 'privateArgs');
      }
      // start a contract for the first time
      return E.when(
        startFn(zcf, privateArgs, contractBaggage),
        ({
          creatorFacet = undefined,
          publicFacet = undefined,
          creatorInvitation = undefined,
          ...unexpected
        }) => {
          const unexpectedKeys = Object.keys(unexpected);
          unexpectedKeys.length === 0 ||
            Fail`contract ${
              prepare ? 'prepare' : 'start'
            } returned unrecognized properties ${unexpectedKeys}`;

          const areDurable = objectMap(
            { creatorFacet, publicFacet, creatorInvitation },
            canBeDurable,
          );
          const allDurable = Object.values(areDurable).every(Boolean);
          if (prepare) {
            allDurable ||
              Fail`values from prepare() must be durable ${areDurable}`;
          }

          if (allDurable) {
            zcfBaggage.init('creatorFacet', creatorFacet);
            zcfBaggage.init('publicFacet', publicFacet);
            zcfBaggage.init('creatorInvitation', creatorInvitation);
          }

          return harden({
            creatorFacet,
            publicFacet,
            creatorInvitation,
            handleOfferObj,
          });
        },
      );
    },

    restartContract: async (privateArgs = undefined) => {
      prepare || Fail`prepare must be defined to upgrade a contract`;
      zoeInstanceAdmin = zcfBaggage.get('zcfInstanceAdmin');
      instanceRecHolder = zcfBaggage.get('instanceRecHolder');
      await initSeatMgrAndMintFactory();

      // restart an upgradeable contract
      return E.when(
        prepare(zcf, privateArgs, contractBaggage),
        ({
          creatorFacet = undefined,
          publicFacet = undefined,
          creatorInvitation = undefined,
        }) => {
          const priorCreatorFacet = zcfBaggage.get('creatorFacet');
          const priorPublicFacet = zcfBaggage.get('publicFacet');
          const priorCreatorInvitation = zcfBaggage.get('creatorInvitation');

          (priorCreatorFacet === creatorFacet &&
            priorPublicFacet === publicFacet &&
            priorCreatorInvitation === creatorInvitation) ||
            Fail`restartContract failed: facets returned by contract changed identity`;
          return harden({
            creatorFacet,
            publicFacet,
            creatorInvitation,
            handleOfferObj,
          });
        },
      );
    },
  };
  return harden(zcfZygote);
};
