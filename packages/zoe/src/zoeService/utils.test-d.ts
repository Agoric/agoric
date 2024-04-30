import type { StartedInstanceKit } from './utils';
import type { ZCF } from './zoe.js';

const someContractStartFn = (
  zcf: ZCF,
  privateArgs: { someNumber: number; someString: string },
) => {};

type PsmInstanceKit = StartedInstanceKit<typeof someContractStartFn>;

const psmInstanceKit: PsmInstanceKit = null as any;

// @ts-expect-error missing privateArgs argument
void psmInstanceKit.adminFacet.restartContract();

const partial = {
  someNumber: 1,
};
// @ts-expect-error missing member of privateArgs argument
void psmInstanceKit.adminFacet.restartContract(partial);

// valid privateArgs now with 'marshaller'
void psmInstanceKit.adminFacet.restartContract({
  ...partial,
  someString: 'str',
});

// @ts-expect-error missing member of privateArgs argument
void psmInstanceKit.adminFacet.upgradeContract('whatever', partial);
// valid privateArgs now with 'marshaller'
void psmInstanceKit.adminFacet.upgradeContract('whatever', {
  ...partial,
  someString: 'str',
});
