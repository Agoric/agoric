import bundleSource from '@endo/bundle-source';
import { E } from '@endo/eventual-send';
import { resolve as importMetaResolve } from 'import-meta-resolve';
import { CONTRACT_ELECTORATE, ParamTypes } from '../src/index.js';

/**
 * @import {Handle, Installation, Instance, Keyword, IssuerKeywordRecord, ZoeService} from '@agoric/zoe';
 * @import {GovernableStartFn} from '../src/types.js';
 */

const makeBundle = async sourceRoot => {
  const url = await importMetaResolve(sourceRoot, import.meta.url);
  const path = new URL(url).pathname;
  const contractBundle = await bundleSource(path);
  return contractBundle;
};

// makeBundle is a slow step, so we do it once for all the tests.
const contractGovernorBundleP = makeBundle('./puppetContractGovernor.js');
// could be called fakeCommittee. It's used as a source of invitations only
const autoRefundBundleP = makeBundle(
  '@agoric/zoe/src/contracts/automaticRefund.js',
);

/**  */

/**
 * @template {GovernableStartFn} T governed contract startfn
 * @param {ERef<ZoeService>} zoe
 * @param {ERef<Installation<T>>} governedP
 * @param {import('@agoric/time').TimerService} timer
 * @param {{ [k: string]: any, governedParams?: Record<string, unknown>, governedApis?: string[] }} termsOfGoverned
 * @param {{}} privateArgsOfGoverned
 * @param {IssuerKeywordRecord} [issuerKeywordRecord]
 */
export const setUpGovernedContract = async (
  zoe,
  governedP,
  timer,
  termsOfGoverned = {},
  privateArgsOfGoverned = {},
  issuerKeywordRecord = {},
) => {
  const [contractGovernorBundle, autoRefundBundle] = await Promise.all([
    contractGovernorBundleP,
    autoRefundBundleP,
  ]);

  /**
   * @type {[
   * Installation<import('./puppetContractGovernor.js').start>,
   * Installation<any>,
   * Installation<T>,
   * ]}
   */
  const [governor, autoRefund, governed] = await Promise.all([
    E(zoe).install(contractGovernorBundle),
    E(zoe).install(autoRefundBundle),
    governedP,
  ]);
  const installs = { governor, autoRefund, governed };

  /**
   * Contract governor wants a committee invitation. Give it a random invitation.
   */
  async function getFakeInvitation() {
    const autoRefundFacets = await E(zoe).startInstance(autoRefund);
    const invitationP = E(autoRefundFacets.publicFacet).makeInvitation();
    const [fakeInvitationPayment, fakeInvitationAmount] = await Promise.all([
      invitationP,
      E(E(zoe).getInvitationIssuer()).getAmountOf(invitationP),
    ]);
    return { fakeInvitationPayment, fakeInvitationAmount };
  }

  const { fakeInvitationAmount, fakeInvitationPayment } =
    await getFakeInvitation();

  const governedTermsWithElectorate = {
    ...termsOfGoverned,
    governedParams: {
      ...termsOfGoverned.governedParams,
      [CONTRACT_ELECTORATE]: {
        type: ParamTypes.INVITATION,
        value: fakeInvitationAmount,
      },
    },
    governedApis: termsOfGoverned.governedApis,
  };
  const governorTerms = {
    timer,
    governedContractInstallation: governed,
    governed: {
      terms: governedTermsWithElectorate,
      issuerKeywordRecord,
    },
  };

  const governorFacets = await E(zoe).startInstance(
    governor,
    {},
    governorTerms,
    {
      governed: {
        ...privateArgsOfGoverned,
        initialPoserInvitation: fakeInvitationPayment,
      },
    },
  );

  return { getFakeInvitation, governorFacets, installs };
};
harden(setUpGovernedContract);
