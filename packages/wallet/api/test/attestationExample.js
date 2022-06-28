// @ts-check
// @jessie-check

import '@agoric/zoe/exported.js';
import { AmountMath } from '@agoric/ertp';
import { E } from '@endo/eventual-send';

/** @param {ZCF} zcf */
export const start = async zcf => {
  const mint = await zcf.makeZCFMint('Attestation');
  const { brand } = await mint.getIssuerRecord();
  const callHistory = {
    /** @type Array<string> */
    wantProposals: [],
    /** @type Array<string> */
    wantAllocations: [],
    /** @type Array<string> */
    returnProposals: [],
    /** @type Array<string> */
    returnAllocations: [],
  };

  const mintAttestation = ({ value }) => {
    const { userSeat, zcfSeat } = zcf.makeEmptySeatKit();
    mint.mintGains({ Attestation: AmountMath.make(brand, value) }, zcfSeat);
    zcfSeat.exit();
    return E(userSeat).getPayout('Attestation');
  };

  const handleWantAtt = seat => {
    const proposal = seat.getProposal();
    callHistory.wantProposals.push(proposal);
    callHistory.wantAllocations.push(seat.getCurrentAllocation());
    mint.mintGains(
      { Attestation: AmountMath.make(brand, proposal.want.Attestation.value) },
      seat,
    );
    seat.exit();
    return 'good job';
  };

  const handleReturnAtt = seat => {
    const proposal = seat.getProposal();
    callHistory.returnProposals.push(proposal);
    callHistory.returnAllocations.push(seat.getCurrentAllocation());
    seat.exit();
    return 'thank you for that';
  };

  const makeWantAttInvitation = () =>
    zcf.makeInvitation(handleWantAtt, 'WantAtt');

  const makeReturnAttInvitation = () =>
    zcf.makeInvitation(handleReturnAtt, 'ReturnAtt');

  const getCallHistory = () => callHistory;

  const publicFacet = {
    mintAttestation,
    makeWantAttInvitation,
    makeReturnAttInvitation,
    getCallHistory,
  };

  return harden({ publicFacet });
};
