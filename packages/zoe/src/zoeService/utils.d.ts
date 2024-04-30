import type { Callable } from '@agoric/internal/src/utils.js';
import type { VatUpgradeResults } from '@agoric/swingset-vat';
import type { Baggage } from '@agoric/swingset-liveslots';

import type { IssuerKeywordRecord, Payment } from './types.js';
import type { Handle } from '../types.js';

// XXX https://github.com/Agoric/agoric-sdk/issues/4565
type SourceBundle = Record<string, any>;

type ContractFacet<T extends {} = {}> = {
  readonly [P in keyof T]: T[P] extends Callable ? T[P] : never;
};

/**
 * Installation of a contract, typed by its start function.
 */
declare const StartFunction: unique symbol;
export type Installation<SF = any> = {
  getBundle: () => SourceBundle;
  getBundleLabel: () => string;
  // because TS is structural, without this the generic is ignored
  readonly [StartFunction]?: SF;
};
export type Instance<SF extends ContractStartFunction = any> =
  Handle<'Instance'> & {
    // because TS is structural, without this the generic is ignored
    readonly [StartFunction]?: SF;
  };

export type InstallationStart<I> =
  I extends Installation<infer SF> ? SF : never;

export type ContractStartFunction = (
  zcf?: ZCF,
  privateArgs?: {},
  baggage?: Baggage,
) => ERef<{ creatorFacet?: {}; publicFacet?: {} }>;

export type AdminFacet<SF extends ContractStartFunction> = {
  // Completion, which is currently any
  getVatShutdownPromise: () => Promise<any>;
  upgradeContract: Parameters<SF>[1] extends undefined
    ? (contractBundleId: string) => Promise<VatUpgradeResults>
    : (
        contractBundleId: string,
        newPrivateArgs: Parameters<SF>[1],
      ) => Promise<VatUpgradeResults>;
  restartContract: Parameters<SF>[1] extends undefined
    ? () => Promise<VatUpgradeResults>
    : (newPrivateArgs: Parameters<SF>[1]) => Promise<VatUpgradeResults>;
};

type StartParams<SF extends ContractStartFunction> =
  Parameters<SF>[0] extends ZCF<infer CT>
    ? Parameters<SF>[1] extends undefined
      ? {
          terms: StandardTerms & CT;
        }
      : {
          terms: StandardTerms & CT;
          privateArgs: Parameters<SF>[1];
        }
    : { terms: StandardTerms & Record<string, any> };

type StartResult<S> = S extends (...args: any) => Promise<infer U>
  ? U
  : ReturnType<S>;

/**
 * Convenience record for contract start function, merging its result with params.
 */
export type ContractOf<S> = StartParams<S> & StartResult<S>;

type StartContractInstance<C> = (
  installation: Installation<C>,
  issuerKeywordRecord?: IssuerKeywordRecord,
  terms?: object,
  privateArgs?: object,
) => Promise<{
  creatorFacet: C['creatorFacet'];
  publicFacet: C['publicFacet'];
  instance: Instance;
  creatorInvitation: C['creatorInvitation'];
  adminFacet: AdminFacet<any>;
}>;

/** The result of `startInstance` */
export type StartedInstanceKit<SF> = {
  instance: Instance<SF>;
  adminFacet: AdminFacet<SF>;
  // theses are empty by default. the return type will override
  creatorFacet: {};
  publicFacet: {};
} & (SF extends ContractStartFunction
  ? // override if the start function specfies the types
    Awaited<ReturnType<SF>>
  : // if it doesn't, allow any
    { creatorFacet: any; publicFacet: any });

/**
 * Zoe is long-lived. We can use Zoe to create smart contract
 * instances by specifying a particular contract installation to use,
 * as well as the `terms` of the contract. The `terms.issuers` is a
 * record mapping string names (keywords) to issuers, such as `{
 * Asset: simoleanIssuer}`. (Note that the keywords must begin with a
 * capital letter and must be ASCII identifiers.) Parties to the
 * contract will use the keywords to index their proposal and their
 * payments.
 *
 * The custom terms are the arguments to the contract, such as the
 * number of bids an auction will wait for before closing. Custom
 * terms are up to the discretion of the smart contract. We get back
 * the creator facet, public facet, and creator invitation as defined
 * by the contract.
 */
export type StartInstance = <SF>(
  installation: Installation<SF> | PromiseLike<Installation<SF>>,
  issuerKeywordRecord?: IssuerKeywordRecord,
  // 'brands' and 'issuers' need not be passed in; Zoe provides them as StandardTerms
  terms?: Omit<StartParams<SF>['terms'], 'brands' | 'issuers'>,
  privateArgs?: Parameters<SF>[1],
  label?: string,
) => Promise<StartedInstanceKit<SF>>;

export type GetPublicFacet = <SF>(
  instance: Instance<SF> | PromiseLike<Instance<SF>>,
) => Promise<StartResult<SF>['publicFacet']>;

export type GetTerms = <SF>(
  instance: Instance<SF>,
) => Promise<StartParams<SF>['terms']>;
