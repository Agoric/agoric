import { TimeMath } from '@agoric/time';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';

/**
 * @import {Installation, ZoeService} from '@agoric/zoe';
 */

/**
 * Start an instance of an Oracle that follows a script. The Oracle has access
 * to a timer, and looks in the script for events indexed by the current time.
 * It responds to onQuery() by reporting any current event. This is intended to
 * be useful for tests.
 * The queries return an object that has fields { event, time, query }. event is
 * whatever was in the script indexed by the time. The query is returned in the
 * result, but has no impact on the result. If the script has no entry for the
 * time, the event is 'nothing to report'.
 *
 * @param {Record<string, any>} script
 * @param {Installation<import('../src/contracts/oracle.js').OracleStart>} oracleInstallation
 * @param {import('@agoric/time').TimerService} timer
 * @param {ZoeService} zoe
 * @param {Issuer} feeIssuer
 */
export async function makeScriptedOracle(
  script,
  oracleInstallation,
  timer,
  zoe,
  feeIssuer,
) {
  /** @type {OracleHandler} */
  const oracleHandler = Far('oracleHandler', {
    async onQuery(query) {
      const timeRecord = await E(timer).getCurrentTimestamp();
      const time = TimeMath.absValue(timeRecord);
      const event = script[`${time}`] || 'Nothing to report';
      const reply = { event, time, query };
      return harden({ reply });
    },
    async onError(_query, _reason) {
      // do nothing
    },
    async onReply(_query, _reply, _fee) {
      // do nothing
    },
  });

  const startResult = await E(zoe).startInstance(oracleInstallation, {
    Fee: feeIssuer,
  });
  const creatorFacet = await E(startResult.creatorFacet).initialize({
    oracleHandler,
  });

  return harden({
    publicFacet: startResult.publicFacet,
    creatorFacet,
  });
}
