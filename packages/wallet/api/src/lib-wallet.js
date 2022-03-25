// @ts-check

/**
 * This file defines the wallet internals without dependency on the ag-solo on
 * which it runs. It could be better factored, as it evolved ex nihilo.
 *
 * Ideally, the APIs defined by ./types.js would drive the organization of this
 * and other implementation files.
 *
 * ./wallet.js describes how this implementation is actually exposed to the user
 * and dapps.
 */

import { assert, details as X, q } from '@agoric/assert';
import { makeLegacyMap, makeScalarMap, makeScalarWeakMap } from '@agoric/store';
import { AmountMath } from '@agoric/ertp';
import { E } from '@endo/eventual-send';

import { makeMarshal, passStyleOf, Far, mapIterable } from '@endo/marshal';
import { Nat } from '@agoric/nat';
import {
  makeNotifierKit,
  observeIteration,
  observeNotifier,
} from '@agoric/notifier';
import { makePromiseKit } from '@endo/promise-kit';

import { makeIssuerTable } from './issuerTable.js';
import { makeDehydrator } from './lib-dehydrate.js';
import { makeId, findOrMakeInvitation } from './findOrMakeInvitation.js';
import { bigintStringify } from './bigintStringify.js';
import { makePaymentActions } from './actions.js';

import '@agoric/store/exported.js';
import '@agoric/zoe/exported.js';

import './internal-types.js';
import './types.js';

// does nothing
const noActionStateChangeHandler = _newState => {};

const cmp = (a, b) => {
  if (a > b) {
    return 1;
  }
  if (a === b) {
    return 0;
  }
  return -1;
};

/**
 * @typedef {Object} MakeWalletParams
 * @property {ERef<ZoeService>} zoe
 * @property {Board} board
 * @property {NameHub} [agoricNames]
 * @property {NameHub} [namesByAddress]
 * @property {MyAddressNameAdmin} myAddressNameAdmin
 * @property {(state: any) => void} [pursesStateChangeHandler=noActionStateChangeHandler]
 * @property {(state: any) => void} [inboxStateChangeHandler=noActionStateChangeHandler]
 * @property {() => number} [dateNow]
 * @param {MakeWalletParams} param0
 */
export function makeWallet({
  zoe,
  board,
  agoricNames,
  namesByAddress,
  myAddressNameAdmin,
  pursesStateChangeHandler = noActionStateChangeHandler,
  inboxStateChangeHandler = noActionStateChangeHandler,
  dateNow = undefined,
}) {
  let lastId = 0;

  /**
   * Add or update a record's `meta` property. Note that the Stamps are in
   * milliseconds since the epoch, and they are only added if this backend has
   * been supplied a `localTimerService`.
   *
   * The `id` is guaranteed to be unique for all records, even if this backend
   * doesn't have a `localTimerService`, or the stamp has not yet increased.
   *
   * @template {Record<string, any>} T
   * @param {T} record What to add metadata to
   * @returns {T & { meta: T['meta'] & RecordMetadata }}
   */
  const addMeta = record => {
    const { meta: oldMeta = {} } = record;
    /** @type {Record<string, any> & T['meta']} */
    const meta = { ...oldMeta };
    if (!meta.id) {
      // Add a unique id to the record.
      lastId += 1;
      meta.id = lastId;
    }
    if (dateNow) {
      const nowStamp = dateNow();
      if (!meta.creationStamp) {
        // Set the creationStamp to be right now.
        meta.creationStamp = nowStamp;
      }
      meta.updatedStamp = nowStamp;
    }
    return { ...record, meta };
  };

  // Create the petname maps so we can dehydrate information sent to
  // the frontend.
  const { makeMapping, dehydrate, edgeMapping } = makeDehydrator();
  /** @type {Mapping<Purse>} */
  const purseMapping = makeMapping('purse');
  /** @type {Mapping<Brand>} */
  const brandMapping = makeMapping('brand');
  /** @type {Mapping<Contact>} */
  const contactMapping = makeMapping(
    'contact',
    { useLegacyMap: true }, // because contacts have identity!
  );
  /** @type {Mapping<Instance>} */
  const instanceMapping = makeMapping('instance');
  /** @type {Mapping<Installation>} */
  const installationMapping = makeMapping('installation');

  const brandTable = makeIssuerTable();
  /** @type {WeakStore<Issuer, string>} */
  const issuerToBoardId = makeScalarWeakMap('issuer');

  // Idempotently initialize the issuer's synchronous boardId mapping.
  const initIssuerToBoardId = async issuer => {
    if (issuerToBoardId.has(issuer)) {
      // We already have a mapping for this issuer.
      return issuerToBoardId.get(issuer);
    }

    // This is an interleaving point.
    const issuerBoardId = await E(board).getId(issuer);
    if (issuerToBoardId.has(issuer)) {
      // Somebody else won the race to .init.
      return issuerToBoardId.get(issuer);
    }

    // We won the race, so .init ourselves.
    issuerToBoardId.init(issuer, issuerBoardId);
    return issuerBoardId;
  };

  /** @type {WeakStore<Purse, Brand>} */
  const purseToBrand = makeScalarWeakMap('purse');
  /** @type {Store<Brand, string>} */
  const brandToDepositFacetId = makeScalarMap('brand');
  /** @type {Store<Brand, Purse>} */
  const brandToAutoDepositPurse = makeScalarMap('brand');

  // Offers that the wallet knows about (the inbox).
  const idToOffer = makeScalarMap('offerId');
  const idToNotifierP = makeScalarMap('offerId');
  /** @type {LegacyMap<string, PromiseRecord<any>>} */
  // Legacy because promise kits are not passables
  const idToOfferResultPromiseKit = makeLegacyMap('id');

  /** @type {WeakStore<Handle<'invitation'>, any>} */
  const invitationHandleToOfferResult = makeScalarWeakMap('invitationHandle');

  // Compiled offers (all ready to execute).
  const idToCompiledOfferP = new Map();
  const idToComplete = new Map();
  const idToSeat = new Map();

  // Client-side representation of the purses inbox;
  /** @type {Map<string, PursesJSONState>} */
  const pursesState = new Map();

  /** @type {Map<Purse, PursesFullState>} */
  const pursesFullState = new Map();
  const inboxState = new Map();

  /**
   * The default Zoe invite purse is used to make an offer.
   *
   * @type {Purse}
   */
  let zoeInvitePurse;

  const ZOE_INVITE_BRAND_PETNAME = 'zoe invite';

  function getSortedValues(map) {
    const entries = [...map.entries()];
    // Sort for determinism.
    const values = entries
      .sort(([id1], [id2]) => cmp(id1, id2))
      .map(([_id, value]) => value);

    return bigintStringify(harden(values));
  }

  function getPursesState() {
    return getSortedValues(pursesState);
  }

  function getInboxState() {
    return getSortedValues(inboxState);
  }

  const noOp = () => {};
  const identitySlotToValFn = (slot, _) => slot;

  // Instead of { body, slots }, fill the slots. This is useful for
  // display but not for data processing, since the special identifier
  // @qclass is lost.
  const { unserialize: fillInSlots } = makeMarshal(noOp, identitySlotToValFn, {
    marshalName: 'wallet',
    // TODO Temporary hack.
    // See https://github.com/Agoric/agoric-sdk/issues/2780
    errorIdNum: 40000,
  });

  /** @type {NotifierRecord<OfferState[]>} */
  const { notifier: offersNotifier, updater: offersUpdater } =
    makeNotifierKit();

  const { pursesNotifier, attenuatedPursesNotifier, pursesUpdater } = (() => {
    /** @type {NotifierRecord<PursesFullState[]>} */
    const { notifier: ipn, updater: ipu } = makeNotifierKit([]);
    /** @type {NotifierRecord<PursesJSONState[]>} */
    const { notifier: apn, updater: apu } = makeNotifierKit([]);
    // explicit whitelist
    /**
     * @param {PursesFullState} _
     * @returns {PursesJSONState}
     */
    const innerFilter = ({
      brand,
      brandBoardId,
      depositBoardId,
      brandPetname,
      pursePetname,
      displayInfo,
      value,
      currentAmountSlots,
      currentAmount,
    }) =>
      harden({
        brand,
        brandBoardId,
        ...(depositBoardId && { depositBoardId }),
        brandPetname,
        pursePetname,
        ...(displayInfo && { displayInfo }),
        value,
        currentAmountSlots,
        currentAmount,
      });
    const filter = state => state.map(innerFilter);
    const pu = Far('pursesUpdater', {
      updateState: newState => {
        ipu.updateState(newState);
        apu.updateState(filter(newState));
      },
      finish: finalState => {
        ipu.finish(finalState);
        apu.finish(filter(finalState));
      },
      fail: reason => {
        ipu.fail(reason);
        apu.fail(reason);
      },
    });
    return harden({
      pursesNotifier: ipn,
      attenuatedPursesNotifier: apn,
      pursesUpdater: pu,
    });
  })();

  /**
   * @param {Petname} pursePetname
   * @param {Purse} purse
   */
  async function updatePursesState(pursePetname, purse) {
    const purseKey = purseMapping.implode(pursePetname);
    for (const key of pursesState.keys()) {
      if (!purseMapping.petnameToVal.has(purseMapping.explode(key))) {
        pursesState.delete(key);
      }
    }
    const currentAmount = await E(purse).getCurrentAmount();
    const { value, brand } = currentAmount;
    const brandPetname = brandMapping.valToPetname.get(brand);
    const dehydratedCurrentAmount = dehydrate(currentAmount);
    const brandBoardId = await E(board).getId(brand);

    let depositBoardId;
    if (
      brandToAutoDepositPurse.has(brand) &&
      brandToAutoDepositPurse.get(brand) === purse &&
      brandToDepositFacetId.has(brand)
    ) {
      // We have a depositId for the purse.
      depositBoardId = brandToDepositFacetId.get(brand);
    }

    const issuerRecord =
      brandTable.hasByBrand(brand) && brandTable.getByBrand(brand);
    /** @type {PursesJSONState} */
    const jstate = addMeta({
      ...pursesState.get(purseKey),
      brand,
      brandBoardId,
      ...(depositBoardId && { depositBoardId }),
      brandPetname,
      pursePetname,
      displayInfo: issuerRecord && issuerRecord.displayInfo,
      value,
      currentAmountSlots: dehydratedCurrentAmount,
      currentAmount: fillInSlots(dehydratedCurrentAmount),
    });
    pursesState.set(purseKey, jstate);

    pursesFullState.set(
      purse,
      harden({
        ...jstate,
        purse,
        brand,
        actions: Far('purse.actions', {
          // Send a value from this purse.
          async send(receiverP, sendValue) {
            const amount = AmountMath.make(brand, sendValue);
            const payment = await E(purse).withdraw(amount);
            try {
              await E(receiverP).receive(payment);
            } catch (e) {
              // Recover the failed payment.
              await E(purse).deposit(payment);
              throw e;
            }
          },
          async receive(paymentP) {
            const payment = await paymentP;
            return E(purse).deposit(payment);
          },
          deposit(payment, amount = undefined) {
            return E(purse).deposit(payment, amount);
          },
        }),
      }),
    );
    pursesUpdater.updateState([...pursesFullState.values()]);
    pursesStateChangeHandler(getPursesState());
  }

  async function updateAllPurseState() {
    return Promise.all(
      mapIterable(purseMapping.petnameToVal.entries(), ([petname, purse]) =>
        updatePursesState(petname, purse),
      ),
    );
  }

  const display = value => fillInSlots(dehydrate(harden(value)));

  const expandInvitationBrands = async invitationDetails => {
    // We currently only add the fee's brand.
    const { fee } = invitationDetails;
    if (!fee) {
      return invitationDetails;
    }

    // Add display info for the fee.
    const displayInfo = await E(E(zoe).getFeeIssuer()).getDisplayInfo();
    const augmentedDetails = {
      ...invitationDetails,
      fee: { ...fee, displayInfo },
    };
    return display(augmentedDetails);
  };

  const displayProposal = proposalTemplate => {
    const {
      want,
      give,
      exit = { onDemand: null },
      arguments: args,
    } = proposalTemplate;
    const displayRecord = pursePetnameValueKeywordRecord => {
      if (pursePetnameValueKeywordRecord === undefined) {
        return undefined;
      }
      return Object.fromEntries(
        Object.entries(pursePetnameValueKeywordRecord).map(
          ([keyword, { pursePetname, value, amount, purse }]) => {
            if (!amount) {
              // eslint-disable-next-line no-use-before-define
              purse = getPurse(pursePetname);
              amount = { value };
            } else {
              pursePetname = purseMapping.valToPetname.get(purse);
            }

            const brand = purseToBrand.get(purse);
            const issuerRecord =
              brandTable.hasByBrand(brand) && brandTable.getByBrand(brand);
            amount = harden({
              ...amount,
              brand,
              displayInfo: issuerRecord && issuerRecord.displayInfo,
            });
            const displayAmount = display(amount);
            return [
              keyword,
              {
                pursePetname,
                purse,
                amount: displayAmount,
              },
            ];
          },
        ),
      );
    };
    const proposalForDisplay = {
      want: displayRecord(want),
      give: displayRecord(give),
      exit,
    };
    if (args !== undefined) {
      proposalForDisplay.arguments = display(args);
    }
    return proposalForDisplay;
  };

  async function updateInboxState(id, offer, doPush = true) {
    // Only sent the uncompiled offer to the client.
    const { proposalTemplate } = offer;
    const { instance, installation, invitationDetails } = idToOffer.get(id);
    if (!instance || !installation) {
      // We haven't yet deciphered the invitation, so don't send
      // this offer.
      return;
    }
    const instanceDisplay = display(instance);
    const installationDisplay = display(installation);
    const alreadyDisplayed =
      inboxState.has(id) && inboxState.get(id).proposalForDisplay;

    const augmentedInvitationDetails = await expandInvitationBrands(
      invitationDetails,
    );

    const offerForDisplay = {
      ...offer,
      // We cannot store the actions, installation, and instance in the
      // displayed offer objects because they are presences and we
      // don't wish to send presences to the frontend.
      actions: undefined,
      installation: undefined,
      instance: undefined,
      proposalTemplate,
      invitationDetails: display(augmentedInvitationDetails),
      instancePetname: instanceDisplay.petname,
      installationPetname: installationDisplay.petname,
      proposalForDisplay: displayProposal(alreadyDisplayed || proposalTemplate),
    };

    inboxState.set(id, offerForDisplay);
    if (doPush) {
      // Only trigger a state change if this was a single update.
      offersUpdater.updateState([...inboxState.values()]);
      inboxStateChangeHandler(getInboxState());
    }
  }

  async function updateAllInboxState() {
    await Promise.all(
      Array.from(inboxState.entries()).map(([id, offer]) =>
        // Don't trigger state changes.
        updateInboxState(id, offer, false),
      ),
    );
    // Now batch together all the state changes.
    offersUpdater.updateState([...inboxState.values()]);
    inboxStateChangeHandler(getInboxState());
  }

  const { updater: issuersUpdater, notifier: issuersNotifier } =
    /** @type {NotifierRecord<[Petname, BrandRecord][]>} */ (
      makeNotifierKit([])
    );

  function updateAllIssuersState() {
    issuersUpdater.updateState(
      [...brandMapping.petnameToVal.entries()].map(([petname, brand]) => {
        const issuerRecord = brandTable.getByBrand(brand);
        return [
          petname,
          {
            ...issuerRecord,
            issuerBoardId: issuerToBoardId.get(issuerRecord.issuer),
          },
        ];
      }),
    );
  }

  // TODO: fix this horribly inefficient update on every potential
  // petname change.
  async function updateAllState() {
    updateAllIssuersState();
    await updateAllPurseState();
    await updateAllInboxState();
  }

  // handle the update, which has already resolved to a record. If the offer is
  // 'done', mark the offer 'complete', otherwise resubscribe to the notifier.
  function updateOrResubscribe(id, seat, update) {
    const { updateCount } = update;
    if (updateCount === undefined) {
      // TODO do we still need these?
      idToSeat.delete(id);

      const offer = idToOffer.get(id);
      const completedOffer = addMeta({
        ...offer,
        status: 'complete',
      });
      idToOffer.set(id, completedOffer);
      updateInboxState(id, completedOffer);
      idToNotifierP.delete(id);
    } else {
      E(idToNotifierP.get(id))
        .getUpdateSince(updateCount)
        .then(nextUpdate => updateOrResubscribe(id, seat, nextUpdate));
    }
  }

  /**
   * There's a new offer. Ask Zoe to notify us when the offer is complete.
   *
   * @param {string} id
   * @param {ERef<UserSeat>} seat
   */
  async function subscribeToNotifier(id, seat) {
    E(seat)
      .getNotifier()
      .then(offerNotifierP => {
        if (!idToNotifierP.has(id)) {
          idToNotifierP.init(id, offerNotifierP);
        }
        E(offerNotifierP)
          .getUpdateSince()
          .then(update => updateOrResubscribe(id, seat, update));
      });
  }

  async function executeOffer(compiledOfferP) {
    // =====================
    // === AWAITING TURN ===
    // =====================

    const {
      inviteP,
      purseKeywordRecord,
      proposal,
      arguments: args,
    } = await compiledOfferP;

    // Track from whence our payment came.
    /** @type {Map<Payment, Purse>} */
    const paymentToPurse = new Map();

    // We now have everything we need to provide Zoe, so do the actual withdrawals.
    // Payments are made for the keywords in proposal.give.
    const keywordPaymentPs = Object.entries(proposal.give || harden({})).map(
      async ([keyword, amount]) => {
        const purse = purseKeywordRecord[keyword];
        assert(
          purse !== undefined,
          X`purse was not found for keyword ${q(keyword)}`,
        );
        const payment = await E(purse).withdraw(amount);
        paymentToPurse.set(payment, purse);
        return [keyword, payment];
      },
    );

    // Try reclaiming any of our payments that we successfully withdrew, but
    // were left unclaimed.
    const tryReclaimingWithdrawnPayments = () =>
      // Use allSettled to ensure we attempt all the deposits, regardless of
      // individual rejections.
      Promise.allSettled(
        keywordPaymentPs.map(async keywordPaymentP => {
          // Wait for the withdrawal to complete.  This protects against a race
          // when updating paymentToPurse.
          const [_keyword, payment] = await keywordPaymentP;

          // Find out where it came from.
          const purse = paymentToPurse.get(payment);
          if (purse === undefined) {
            // We already tried to reclaim this payment, so stop here.
            return undefined;
          }

          // Now send it back to the purse.
          try {
            // eslint-disable-next-line no-use-before-define
            return addPayment(payment, purse);
          } finally {
            // Once we've called addPayment, mark this one as done.
            paymentToPurse.delete(payment);
          }
        }),
      );

    // Gather all of our payments, and if there's an error, reclaim the ones
    // that were successfuly withdrawn.
    const withdrawAllPayments = Promise.all(keywordPaymentPs);
    withdrawAllPayments.catch(tryReclaimingWithdrawnPayments);

    // =====================
    // === AWAITING TURN ===
    // =====================

    // this await is purely to prevent "embarrassment" of
    // revealing to zoe that we had insufficient funds/assets
    // for the offer.
    const paymentKeywords = await withdrawAllPayments;
    const paymentKeywordRecord = harden(Object.fromEntries(paymentKeywords));

    const seat = E(zoe).offer(
      inviteP,
      harden(proposal),
      paymentKeywordRecord,
      args,
    );
    // By the time Zoe settles the seat promise, the escrow should be complete.
    // Reclaim if it is somehow not.
    seat.finally(tryReclaimingWithdrawnPayments);

    // Even if the seat doesn't settle, we can still pipeline our request for
    // payouts.
    const depositedP = E(seat)
      .getPayouts()
      .then(payoutObj => {
        return Promise.all(
          Object.entries(payoutObj).map(([keyword, payoutP]) => {
            // We try to find a purse for this keyword, but even if we don't,
            // we still make it a normal incoming payment.
            const purseOrUndefined = purseKeywordRecord[keyword];

            // eslint-disable-next-line no-use-before-define
            return addPayment(payoutP, purseOrUndefined);
          }),
        );
      });

    // Regardless of the status of the offer, we try to clean up any of our
    // unclaimed payments.  Defensively, we want to do this as soon as possible
    // even if the seat doesn't settle.
    depositedP.finally(tryReclaimingWithdrawnPayments);

    // Return a promise that will resolve after successful deposit, as well as
    // the promise for the seat.
    return { depositedP, seat };
  }

  // === API

  const addIssuer = async (petnameForBrand, issuerP, makePurse = false) => {
    const issuer = await issuerP;
    const recP = brandTable.hasByIssuer(issuer)
      ? brandTable.getByIssuer(issuer)
      : brandTable.initIssuer(issuer, addMeta);
    const { brand } = await recP;
    await initIssuerToBoardId(issuer);
    const addBrandPetname = () => {
      let p;
      const already = brandMapping.valToPetname.has(brand);
      petnameForBrand = brandMapping.suggestPetname(petnameForBrand, brand);
      if (!already && makePurse) {
        // eslint-disable-next-line no-use-before-define
        p = makeEmptyPurse(petnameForBrand, petnameForBrand, true);
      } else {
        p = Promise.resolve();
      }
      return p.then(_ => petnameForBrand);
    };
    return addBrandPetname().then(async brandName => {
      await updateAllIssuersState();
      return brandName;
    });
  };

  const publishIssuer = async brand => {
    const { issuer } = brandTable.getByBrand(brand);
    const issuerBoardId = await initIssuerToBoardId(issuer);
    updateAllIssuersState();
    return issuerBoardId;
  };

  const { updater: contactsUpdater, notifier: contactsNotifier } =
    /** @type {NotifierRecord<[Petname, Contact][]>} */ (makeNotifierKit([]));

  /**
   * @param {Petname} petname
   * @param {ERef<{ receive: (payment: Payment) => Promise<void> }>} actions
   * @param {string} [address]
   */
  const addContact = async (petname, actions, address = undefined) => {
    const already = await E(board).has(actions);
    let depositFacet;
    if (already) {
      depositFacet = actions;
    } else {
      depositFacet = Far('depositFacet', {
        receive(paymentP) {
          return E(actions).receive(paymentP);
        },
      });
    }
    const depositBoardId = await E(board).getId(depositFacet);
    const found = [...contactMapping.petnameToVal.entries()].find(
      ([_pn, { depositBoardId: dbid }]) => depositBoardId === dbid,
    );

    assert(
      !found,
      X`${q(found && found[0])} is already the petname for board ID ${q(
        depositBoardId,
      )}`,
    );

    const contact = harden(
      addMeta({
        actions,
        address,
        depositBoardId,
      }),
    );

    contactMapping.suggestPetname(petname, contact);
    contactsUpdater.updateState([...contactMapping.petnameToVal.entries()]);
    return contact;
  };

  const addInstance = (petname, instanceHandle) => {
    // We currently just add the petname mapped to the instanceHandle
    // value, but we could have a list of known instances for
    // possible display in the wallet.
    petname = instanceMapping.suggestPetname(petname, instanceHandle);
    // We don't wait for the update before returning.
    updateAllState();
    return `instance ${q(petname)} successfully added to wallet`;
  };

  /**
   * This function is marked internal and unsafe because it permits importing a
   * shared purse (which we don't necessarily trust).
   *
   * @param {Petname} brandPetname
   * @param {Petname} petnameForPurse
   * @param {boolean} defaultAutoDeposit
   * @param {ERef<Purse> | undefined} purseToImport
   */
  const internalUnsafeImportPurse = async (
    brandPetname,
    petnameForPurse,
    defaultAutoDeposit,
    purseToImport,
  ) => {
    const brand = brandMapping.petnameToVal.get(brandPetname);
    const { issuer } = brandTable.getByBrand(brand);

    /** @type {Purse} */
    const purse = await (purseToImport || E(issuer).makeEmptyPurse());

    purseToBrand.init(purse, brand);
    petnameForPurse = purseMapping.suggestPetname(petnameForPurse, purse);

    if (defaultAutoDeposit && !brandToAutoDepositPurse.has(brand)) {
      // Try to initialize the autodeposit purse for this brand.
      // Don't do state updates, since we'll do that next.
      // eslint-disable-next-line no-use-before-define
      await doEnableAutoDeposit(petnameForPurse, false);
    }

    await updatePursesState(petnameForPurse, purse);

    // Just notice the balance updates for the purse.
    observeNotifier(E(purse).getCurrentAmountNotifier(), {
      updateState(_balance) {
        updatePursesState(purseMapping.valToPetname.get(purse), purse).catch(
          e => console.error('cannot updateState', e),
        );
      },
      fail(reason) {
        console.error(`failed updateState observer`, reason);
      },
    });

    return petnameForPurse;
  };

  // This function is exposed to the walletAdmin.
  const makeEmptyPurse = (
    brandPetname,
    petnameForPurse,
    defaultAutoDeposit = true,
  ) =>
    internalUnsafeImportPurse(
      brandPetname,
      petnameForPurse,
      defaultAutoDeposit,
      undefined,
    );

  async function deposit(pursePetname, payment) {
    const purse = purseMapping.petnameToVal.get(pursePetname);
    return E(purse).deposit(payment);
  }

  function getPurses() {
    return [...purseMapping.petnameToVal.entries()];
  }

  function getPurse(pursePetname) {
    return purseMapping.petnameToVal.get(pursePetname);
  }

  function getPurseIssuer(pursePetname) {
    const purse = purseMapping.petnameToVal.get(pursePetname);
    const brand = purseToBrand.get(purse);
    const { issuer } = brandTable.getByBrand(brand);
    return issuer;
  }

  function getOffers({ origin = null } = {}) {
    // return the offers sorted by id
    return [...idToOffer.entries()]
      .filter(
        ([_id, offer]) =>
          origin === null ||
          (offer.requestContext && offer.requestContext.dappOrigin === origin),
      )
      .sort(([id1], [id2]) => cmp(id1, id2))
      .map(([_id, offer]) => harden(offer));
  }

  const compileProposal = proposalTemplate => {
    const {
      want = harden({}),
      give = harden({}),
      exit = { onDemand: null },
      arguments: args,
    } = proposalTemplate;

    const purseKeywordRecord = {};

    const compile = amountKeywordRecord => {
      return harden(
        Object.fromEntries(
          Object.entries(amountKeywordRecord).map(
            ([keyword, { pursePetname, value }]) => {
              // Automatically convert numbers to Nats.
              if (typeof value === 'number') {
                value = Nat(value);
              }
              const purse = getPurse(pursePetname);
              purseKeywordRecord[keyword] = purse;
              const brand = purseToBrand.get(purse);
              const amount = {
                brand,
                value,
              };
              return [keyword, amount];
            },
          ),
        ),
      );
    };

    const proposal = {
      want: compile(want),
      give: compile(give),
      exit,
    };

    return { proposal, arguments: args, purseKeywordRecord };
  };

  const compileOffer = async offer => {
    const {
      proposal,
      purseKeywordRecord,
      arguments: args,
    } = compileProposal(offer.proposalTemplate);

    // eslint-disable-next-line no-use-before-define
    const zoeIssuer = issuerManager.get(ZOE_INVITE_BRAND_PETNAME);
    const { brand: invitationBrand } = brandTable.getByIssuer(zoeIssuer);
    const invitationP = findOrMakeInvitation(
      idToOfferResultPromiseKit,
      board,
      zoeInvitePurse,
      invitationBrand,
      offer,
    );

    const invitationDetails = await E(zoe).getInvitationDetails(invitationP);
    const { installation, instance } = invitationDetails;

    const compiled = {
      arguments: args,
      proposal,
      inviteP: invitationP,
      purseKeywordRecord,
      invitationDetails,
      installation,
      instance,
    };
    return compiled;
  };

  /** @type {Store<string, DappRecord>} */
  const dappOrigins = makeScalarMap('dappOrigin');
  const { notifier: dappsNotifier, updater: dappsUpdater } =
    /** @type {NotifierRecord<DappRecord[]>} */ (makeNotifierKit([]));

  const updateDapp = dappRecord => {
    harden(addMeta(dappRecord));
    dappOrigins.set(dappRecord.origin, dappRecord);
    dappsUpdater.updateState([...dappOrigins.values()]);
  };

  const deleteDapp = ({ origin }) => {
    dappOrigins.delete(origin);
    dappsUpdater.updateState([...dappOrigins.values()]);
  };

  async function waitForDappApproval(
    suggestedPetname,
    origin,
    notYetEnabled = () => {},
  ) {
    let dappRecord;
    if (dappOrigins.has(origin)) {
      dappRecord = dappOrigins.get(origin);
    } else {
      let resolve;
      let reject;
      let approvalP;

      dappRecord = addMeta({
        suggestedPetname,
        petname: suggestedPetname,
        origin,
        approvalP,
        enable: false,
        actions: Far('dapp.actions', {
          setPetname(petname) {
            if (dappRecord.petname === petname) {
              return dappRecord.actions;
            }
            if (edgeMapping.valToPetname.has(origin)) {
              edgeMapping.renamePetname(petname, origin);
            } else {
              petname = edgeMapping.suggestPetname(petname, origin);
            }
            dappRecord = addMeta({
              ...dappRecord,
              petname,
            });
            updateDapp(dappRecord);
            updateAllState();
            return dappRecord.actions;
          },
          enable() {
            // Enable the dapp with the attached petname.
            dappRecord = addMeta({
              ...dappRecord,
              enable: true,
            });
            edgeMapping.suggestPetname(dappRecord.petname, origin);
            updateDapp(dappRecord);

            // Allow the pending requests to pass.
            resolve();
            return dappRecord.actions;
          },
          disable(reason = undefined) {
            // Reject the pending dapp requests.
            if (reject) {
              reject(reason);
            }
            // Create a new, suspended-approval record.
            ({ resolve, reject, promise: approvalP } = makePromiseKit());
            dappRecord = addMeta({
              ...dappRecord,
              enable: false,
              approvalP,
            });
            updateDapp(dappRecord);
            return dappRecord.actions;
          },
          delete() {
            if (reject) {
              reject('Dapp deleted');
            }
            deleteDapp(dappRecord);
          },
        }),
      });

      // Prepare the table entry to be updated.
      dappOrigins.init(origin, dappRecord);

      // Initially disable it.
      dappRecord.actions.disable();
    }

    if (!dappRecord.enable) {
      notYetEnabled();
    }
    await dappRecord.approvalP;
    // AWAIT
    // Refetch the origin record.
    return dappOrigins.get(origin);
  }

  async function addOffer(rawOffer, requestContext = {}) {
    const dappOrigin =
      requestContext.dappOrigin || requestContext.origin || 'unknown';
    const { id: rawId } = rawOffer;
    const id = makeId(dappOrigin, rawId);
    const offer = harden(
      addMeta({
        ...rawOffer,
        rawId,
        id,
        requestContext: { ...requestContext, dappOrigin },
        status: undefined,
      }),
    );
    idToOffer.init(id, offer);
    idToOfferResultPromiseKit.init(id, makePromiseKit());
    await updateInboxState(id, offer);

    // Compile the offer
    const compiledOfferP = compileOffer(offer);
    idToCompiledOfferP.set(id, compiledOfferP);

    // Our inbox state may have an enriched offer.
    await updateInboxState(id, idToOffer.get(id));
    const { installation, instance, invitationDetails } = await compiledOfferP;

    if (!idToOffer.has(id)) {
      return rawId;
    }
    idToOffer.set(
      id,
      harden(
        addMeta({
          ...idToOffer.get(id),
          installation,
          instance,
          invitationDetails,
        }),
      ),
    );
    await updateInboxState(id, idToOffer.get(id));
    return rawId;
  }

  function consummated(offer) {
    if (offer.status !== undefined) {
      return true;
    }
    if (offer.actions) {
      E(offer.actions).handled(offer);
    }
    return false;
  }

  async function declineOffer(id) {
    const offer = idToOffer.get(id);
    if (consummated(offer)) {
      return;
    }

    // Update status, drop the proposal
    const declinedOffer = addMeta({
      ...offer,
      status: 'decline',
    });
    idToOffer.set(id, declinedOffer);
    updateInboxState(id, declinedOffer);

    // Try to reclaim the invitation.
    const compiledOfferP = idToCompiledOfferP.get(id);
    if (!compiledOfferP) {
      return;
    }

    // eslint-disable-next-line no-use-before-define
    await addPayment(E.get(compiledOfferP).inviteP).catch(console.error);
  }

  async function cancelOffer(id) {
    const completeFn = idToComplete.get(id);
    if (!completeFn) {
      return false;
    }

    completeFn()
      .then(_ => {
        idToComplete.delete(id);
        const offer = idToOffer.get(id);
        const cancelledOffer = addMeta({
          ...offer,
          status: 'cancel',
        });
        idToOffer.set(id, cancelledOffer);
        updateInboxState(id, cancelledOffer);
      })
      .catch(e => console.error(`Cannot cancel offer ${id}:`, e));

    return true;
  }

  async function acceptOffer(id) {
    const offer = idToOffer.get(id);
    if (consummated(offer)) {
      return undefined;
    }

    /** @type {{ depositedP?: Promise<any[]>; dappContext?: any }} */
    let ret = {};
    let alreadyResolved = false;
    const rejected = e => {
      if (alreadyResolved) {
        return;
      }
      const rejectOffer = addMeta({
        ...offer,
        status: 'rejected',
        error: `${e}`,
      });
      idToOffer.set(id, rejectOffer);
      updateInboxState(id, rejectOffer);
    };

    try {
      const pendingOffer = addMeta({
        ...offer,
        status: 'pending',
      });
      idToOffer.set(id, pendingOffer);
      updateInboxState(id, pendingOffer);
      const compiledOffer = await idToCompiledOfferP.get(id);

      const { depositedP, seat } = await executeOffer(compiledOffer);

      idToComplete.set(id, () => {
        alreadyResolved = true;
        return E(seat).tryExit();
      });
      idToSeat.set(id, seat);
      // The offer might have been postponed, or it might have been immediately
      // consummated. Only subscribe if it was postponed.
      E(seat)
        .hasExited()
        .then(exited => {
          if (!exited) {
            subscribeToNotifier(id, seat);
          }
        });

      const offerResultP = E(seat).getOfferResult();
      idToOfferResultPromiseKit.get(id).resolve(offerResultP);

      ret = {
        depositedP,
        dappContext: offer.dappContext,
      };

      // Update status, drop the proposal
      depositedP
        .then(_ => {
          // We got something back, so no longer pending or rejected.
          if (!alreadyResolved) {
            alreadyResolved = true;
            const acceptedOffer = addMeta({
              ...pendingOffer,
              status: 'accept',
            });
            idToOffer.set(id, acceptedOffer);
            updateInboxState(id, acceptedOffer);
          }
        })
        .catch(rejected);
    } catch (e) {
      if (offer.actions) {
        E(offer.actions).error(offer, e);
      }
      rejected(e);
      throw e;
    }
    return ret;
  }

  /** @type {Store<number, PaymentRecord>} */
  const idToPaymentRecord = makeScalarMap('paymentId');
  const { updater: paymentsUpdater, notifier: paymentsNotifier } =
    /** @type {NotifierRecord<PaymentRecord[]>} */ (makeNotifierKit([]));
  /** @param {PaymentRecord} param0 */
  const updatePaymentRecord = ({ actions, ...preDisplay }) => {
    const displayPayment = fillInSlots(dehydrate(harden(preDisplay)));
    const paymentRecord = addMeta({
      ...preDisplay,
      actions,
      displayPayment,
    });
    const { id } = paymentRecord.meta;
    idToPaymentRecord.set(id, harden(paymentRecord));
    paymentsUpdater.updateState([...idToPaymentRecord.values()]);
  };

  const makePaymentActionsForId = id =>
    makePaymentActions({
      getRecord: () => idToPaymentRecord.get(id),
      updateRecord: (record, withoutMeta = {}) => {
        // This order is important, so that the `withoutMeta.meta` gets
        // overridden by `record.meta`.
        updatePaymentRecord({ ...withoutMeta, ...addMeta(record) });
      },
      getBrandRecord: brand =>
        brandTable.hasByBrand(brand) && brandTable.getByBrand(brand),
      getPurseByPetname: petname => purseMapping.petnameToVal.get(petname),
      getAutoDepositPurse: b =>
        brandToAutoDepositPurse.has(b)
          ? brandToAutoDepositPurse.get(b)
          : undefined,
      getIssuerBoardId: issuerToBoardId.get,
    });

  /**
   * @param {ERef<Payment>} paymentP
   * @param {Purse | Petname} [depositTo]
   */
  const addPayment = async (paymentP, depositTo = undefined) => {
    // We don't even create the record until we resolve the payment.
    const [payment, brand] = await Promise.all([
      paymentP,
      E(paymentP).getAllegedBrand(),
    ]);

    const basePaymentRecord = addMeta({
      payment,
      brand,
    });
    const { id } = basePaymentRecord.meta;

    /** @type {PaymentRecord} */
    const paymentRecord = {
      ...basePaymentRecord,
      actions: makePaymentActionsForId(id),
    };
    idToPaymentRecord.init(id, harden(paymentRecord));

    const refreshed = await paymentRecord.actions.refresh();
    if (!refreshed) {
      // Only update if the refresh didn't.
      updatePaymentRecord(paymentRecord);
    }

    // Try an automatic deposit.
    await paymentRecord.actions.deposit(depositTo);
  };

  let selfContactP;
  async function getDepositFacetId(_brandBoardId) {
    // Always return the generic deposit facet.
    return E.get(selfContactP).depositBoardId;
  }

  async function disableAutoDeposit(pursePetname) {
    const purse = purseMapping.petnameToVal.get(pursePetname);
    const brand = purseToBrand.get(purse);
    if (
      !brandToAutoDepositPurse.has(brand) ||
      brandToAutoDepositPurse.get(brand) !== purse
    ) {
      return;
    }

    brandToAutoDepositPurse.delete(brand);
    await updateAllPurseState();
  }

  const pendingEnableAutoDeposits = makeScalarMap('brand');
  async function doEnableAutoDeposit(pursePetname, updateState) {
    const purse = purseMapping.petnameToVal.get(pursePetname);
    const brand = purseToBrand.get(purse);
    if (brandToAutoDepositPurse.has(brand)) {
      brandToAutoDepositPurse.set(brand, purse);
    } else {
      brandToAutoDepositPurse.init(brand, purse);
    }

    if (updateState) {
      await updateAllPurseState();
    }

    const pendingP =
      pendingEnableAutoDeposits.has(brand) &&
      pendingEnableAutoDeposits.get(brand);
    if (pendingP) {
      return pendingP;
    }

    const boardIdP = E.get(selfContactP).depositBoardId;
    pendingEnableAutoDeposits.init(brand, boardIdP);
    const boardId = await boardIdP;
    brandToDepositFacetId.init(brand, boardId);

    if (updateState) {
      await updateAllPurseState();
    }
    return boardIdP;
  }

  /**
   * @param {(petname: string | string[], value: any) => void} acceptFn
   * @param {string | string[]} suggestedPetname
   * @param {string} boardId
   * @param {string} [dappOrigin]
   */
  function acceptPetname(
    acceptFn,
    suggestedPetname,
    boardId,
    dappOrigin = undefined,
  ) {
    let petname;
    if (dappOrigin === undefined) {
      petname = suggestedPetname;
    } else {
      const edgename = edgeMapping.valToPetname.get(dappOrigin);
      petname = [edgename, suggestedPetname];
    }

    return E(board)
      .getValue(boardId)
      .then(value => acceptFn(petname, value));
  }

  /**
   * @param {Petname} suggestedPetname
   * @param {string} issuerBoardId
   * @param {string} [dappOrigin]
   */
  async function suggestIssuer(
    suggestedPetname,
    issuerBoardId,
    dappOrigin = undefined,
  ) {
    // TODO: add an approval step in the wallet UI in which
    // suggestion can be rejected and the suggested petname can be
    // changed
    return acceptPetname(
      // Make a purse if we add the issuer.
      (petname, value) => addIssuer(petname, value, true),
      suggestedPetname,
      issuerBoardId,
      dappOrigin,
    );
  }

  /**
   * @param {Petname} suggestedPetname
   * @param {string} instanceHandleBoardId
   * @param {string} [dappOrigin]
   */
  async function suggestInstance(
    suggestedPetname,
    instanceHandleBoardId,
    dappOrigin = undefined,
  ) {
    // TODO: add an approval step in the wallet UI in which
    // suggestion can be rejected and the suggested petname can be
    // changed

    return acceptPetname(
      addInstance,
      suggestedPetname,
      instanceHandleBoardId,
      dappOrigin,
    );
  }

  /**
   * @param {Petname} suggestedPetname
   * @param {string} installationHandleBoardId
   * @param {string} [dappOrigin]
   */
  async function suggestInstallation(
    suggestedPetname,
    installationHandleBoardId,
    dappOrigin = undefined,
  ) {
    // TODO: add an approval step in the wallet UI in which
    // suggestion can be rejected and the suggested petname can be
    // changed
    return acceptPetname(
      // eslint-disable-next-line no-use-before-define
      installationManager.add,
      suggestedPetname,
      installationHandleBoardId,
      dappOrigin,
    );
  }

  function getBrand(petname) {
    const brand = brandMapping.petnameToVal.get(petname);
    return brand;
  }

  function getBrandPetnames(brands) {
    return brands.map(brandMapping.valToPetname.get);
  }

  function getSelfContact() {
    return selfContactP;
  }

  const makeManager = (petnameMapping, managerType) => {
    const manager = Far(managerType, {
      rename: async (petname, thing) => {
        petnameMapping.renamePetname(petname, thing);
        await updateAllState();
      },
      get: petnameMapping.petnameToVal.get,
      getAll: petnameMapping.petnameToVal.entries,
      add: async (petname, thing) => {
        petnameMapping.suggestPetname(petname, thing);
        await updateAllState();
      },
    });
    return manager;
  };

  /** @type {InstallationManager} */
  const installationManager = makeManager(
    installationMapping,
    'InstallationManager',
  );

  /** @type {InstanceManager} */
  const instanceManager = makeManager(instanceMapping, 'InstanceManager');

  /** @type {IssuerManager} */
  const issuerManager = Far('IssuerManager', {
    rename: async (petname, issuer) => {
      assert(
        brandTable.hasByIssuer(issuer),
        `issuer has not been previously added`,
      );
      const brandRecord = brandTable.getByIssuer(issuer);
      brandMapping.renamePetname(petname, brandRecord.brand);
      await updateAllState();
    },
    get: petname => {
      const brand = brandMapping.petnameToVal.get(petname);
      return brandTable.getByBrand(brand).issuer;
    },
    getAll: () => {
      return [...brandMapping.petnameToVal.entries()].map(
        ([petname, brand]) => {
          const { issuer } = brandTable.getByBrand(brand);
          return [petname, issuer];
        },
      );
    },
    add: async (petname, issuerP) => {
      const { brand, issuer } = await brandTable.initIssuer(issuerP, addMeta);
      await initIssuerToBoardId(issuer);
      brandMapping.suggestPetname(petname, brand);
      await updateAllIssuersState();
    },
  });

  function getInstallationManager() {
    return installationManager;
  }

  function getInstanceManager() {
    return instanceManager;
  }

  function getIssuerManager() {
    return issuerManager;
  }

  async function saveOfferResult(invitationHandle, offerResult) {
    invitationHandleToOfferResult.init(invitationHandle, offerResult);
  }

  async function getOfferResult(invitationHandle) {
    return invitationHandleToOfferResult.get(invitationHandle);
  }

  async function getUINotifier(rawId, dappOrigin = 'unknown') {
    const id = makeId(dappOrigin, rawId);
    const offerResult = await idToOfferResultPromiseKit.get(id).promise;
    assert(
      passStyleOf(offerResult) === 'copyRecord',
      `offerResult must be a record to have a uiNotifier`,
    );
    assert(offerResult.uiNotifier, X`offerResult does not have a uiNotifier`);
    return offerResult.uiNotifier;
  }

  const wallet = Far('wallet', {
    saveOfferResult,
    getOfferResult,
    waitForDappApproval,
    getDappsNotifier() {
      return dappsNotifier;
    },
    getPursesNotifier() {
      return pursesNotifier;
    },
    getAttenuatedPursesNotifier() {
      return attenuatedPursesNotifier;
    },
    getIssuersNotifier() {
      return issuersNotifier;
    },
    getOffersNotifier() {
      return offersNotifier;
    },
    /** @deprecated Use issuerManager.add instead */
    addIssuer: issuerManager.add,
    getBrand,
    getBrandPetnames,
    publishIssuer,
    /** @deprecated Use instanceManager.add instead */
    addInstance: instanceManager.add,
    /** @deprecated Use installationManager.add instead */
    addInstallation: installationManager.add,
    getInstallationManager,
    getInstanceManager,
    getIssuerManager,
    /** @deprecated Use issuerManager.rename instead */
    renameIssuer: issuerManager.rename,
    /** @deprecated Use instanceManager.rename instead */
    renameInstance: instanceManager.rename,
    /** @deprecated Use installationManager.rename instead */
    renameInstallation: installationManager.rename,
    getSelfContact,
    /** @deprecated Use instanceManager.get instead */
    getInstance: instanceManager.get,
    /** @deprecated Use installationManager.get instead */
    getInstallation: installationManager.get,
    /** @deprecated Use installationManager.getAll instead */
    getInstallations: installationManager.getAll,
    makeEmptyPurse,
    deposit,
    /** @deprecated Use issuerManager.get instead */
    getIssuer: issuerManager.get,
    /** @deprecated Use issuerManager.getAll instead */
    getIssuers: issuerManager.getAll,
    getPurses,
    getPurse,
    getPurseIssuer,
    addOffer,
    declineOffer,
    cancelOffer,
    acceptOffer,
    getOffers,
    getSeat: id => idToSeat.get(id),
    getSeats: ids => ids.map(wallet.getSeat),
    enableAutoDeposit(pursePetname) {
      // Enable the autodeposit with intermediary state updates.
      return doEnableAutoDeposit(pursePetname, true);
    },
    disableAutoDeposit,
    getDepositFacetId,
    suggestIssuer,
    suggestInstance,
    suggestInstallation,
    addContact,
    getContactsNotifier() {
      return contactsNotifier;
    },
    addPayment,
    getPaymentsNotifier() {
      return paymentsNotifier;
    },
    getUINotifier,
    getZoe() {
      return zoe;
    },
    getBoard() {
      return board;
    },
    getAgoricNames(...path) {
      assert(agoricNames, X`agoricNames was not supplied to the wallet maker`);
      return E(agoricNames).lookup(...path);
    },
    getNamesByAddress(...path) {
      assert(
        namesByAddress,
        X`namesByAddress was not supplied to the wallet maker`,
      );
      return E(namesByAddress).lookup(...path);
    },
  });

  const initialize = async () => {
    // Allow people to send us payments.
    const selfDepositFacet = Far('contact', {
      receive(payment) {
        return addPayment(payment);
      },
    });

    const address = await E(myAddressNameAdmin).getMyAddress();
    // We need to do this before we can enable auto deposit.
    selfContactP = addContact('Self', selfDepositFacet, address);

    // Make Zoe invite purse
    const ZOE_INVITE_PURSE_PETNAME = 'Default Zoe invite purse';
    const inviteIssuerP = E(zoe).getInvitationIssuer();
    const addZoeIssuer = issuerP =>
      issuerManager.add(ZOE_INVITE_BRAND_PETNAME, issuerP);
    const makeInvitePurse = () =>
      wallet.makeEmptyPurse(ZOE_INVITE_BRAND_PETNAME, ZOE_INVITE_PURSE_PETNAME);
    const addInviteDepositFacet = () =>
      E(wallet).enableAutoDeposit(ZOE_INVITE_PURSE_PETNAME);

    await addZoeIssuer(inviteIssuerP)
      .then(makeInvitePurse)
      .then(addInviteDepositFacet);
    zoeInvitePurse = wallet.getPurse(ZOE_INVITE_PURSE_PETNAME);

    await E(myAddressNameAdmin).update('depositFacet', selfDepositFacet);
  };

  // Importing assets as virtual purses from the bank is a highly-trusted path.
  // We don't want to expose this mechanism to the user, in case they shoot
  // themselves in the foot with it by importing an asset/virtual purse they
  // don't really trust.
  const importBankAssets = async bank => {
    observeIteration(E(bank).getAssetSubscription(), {
      async updateState({ proposedName, issuerName, issuer, brand }) {
        try {
          issuerName = await addIssuer(issuerName, issuer);
          const purse = await E(bank).getPurse(brand);
          // We can import this purse, because we trust the bank.
          await internalUnsafeImportPurse(
            issuerName,
            proposedName,
            true,
            purse,
          );
        } catch (e) {
          console.error('/// could not add bank asset purse', e, {
            issuerName,
            proposedName,
            issuer,
            brand,
          });
        }
      },
    }).finally(() => console.error('/// This is the end of the bank assets'));
  };
  return {
    admin: wallet,
    initialized: initialize(),
    importBankAssets,
  };
}
