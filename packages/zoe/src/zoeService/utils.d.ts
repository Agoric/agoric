import { Callable } from '@agoric/eventual-send';
import type { Instance, IssuerKeywordRecord, Payment } from './types.js';

// XXX https://github.com/Agoric/agoric-sdk/issues/4565
type SourceBundle = Record<string, any>;

type ContractFacet<T extends {} = {}> = {
  readonly [P in keyof T]: T[P] extends Callable ? T[P] : never;
};

type AdminFacet = {
  getVatShutdownPromise: () => Promise<any>; // Completion, which is currently any
};

/** Installation of a contract, typed by its start function. */
declare const StartFunction: unique symbol;
export type Installation<SF> = {
  getBundle: () => SourceBundle;
  // because TS is structural, without this the generic is ignored
  [StartFunction]: SF;
};

// XXX contortions to not include the fn on the Installation object
export type InstallationStart<I> = I extends Installation<infer SF>
  ? SF
  : never;

type StartParams<S> = {
  terms: ReturnType<Parameters<S>[0]['getTerms']>;
  privateArgs: Parameters<S>[1];
};

type StartResult<S> = S extends (...args: any) => Promise<infer U>
  ? U
  : ReturnType<S>;

/** Convenience record for contract start function, merging its result with params. */
export type ContractOf<S> = StartParams<S> & StartResult<S>;

type StartContractInstance<C> = (
  installation: Installation<C>,
  issuerKeywordRecord?: IssuerKeywordRecord,
  terms?: Object,
  privateArgs?: Object,
) => Promise<{
  creatorFacet: C['creatorFacet'];
  publicFacet: C['publicFacet'];
  instance: Instance;
  creatorInvitation: C['creatorInvitation'];
  adminFacet: AdminFacet;
}>;

/**
 * Zoe is long-lived. We can use Zoe to create smart contract instances by
 * specifying a particular contract installation to use, as well as the `terms`
 * of the contract. The `terms.issuers` is a record mapping string names
 * (keywords) to issuers, such as `{ Asset: simoleanIssuer}`. (Note that the
 * keywords must begin with a capital letter and must be ASCII identifiers.)
 * Parties to the contract will use the keywords to index their proposal and
 * their payments.
 *
 * The custom terms are the arguments to the contract, such as the number of
 * bids an auction will wait for before closing. Custom terms are up to the
 * discretion of the smart contract. We get back the creator facet, public
 * facet, and creator invitation as defined by the contract.
 */
export type StartInstance = <I extends Installation>(
  installation: I | PromiseLike<I>,
  issuerKeywordRecord?: IssuerKeywordRecord,
  terms?: object,
  privateArgs?: Object,
) => Promise<
  {
    instance: Instance;
    adminFacet: AdminFacet;
  } & ReturnType<InstallationStart<I>>
>;
