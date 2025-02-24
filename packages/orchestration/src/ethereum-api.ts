/**
 * Info for an Ethereum-based chain.
 */
export type EthChainInfo = Readonly<{
  // XXX consider ~BaseChainInfo type, with `cctpDestinationDomain` + `chainId`
  cctpDestinationDomain?: number;
  chainId: string;
  allegedName: string;
}>;
