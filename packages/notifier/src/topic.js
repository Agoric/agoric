// @jessie-check

import { Far } from '@endo/far';

/**
 * @import {EachTopic, LatestTopic} from '../src/types.js';
 */

/**
 * @deprecated A pinned-history topic preserves all of its published values in
 * memory.  Use a prefix-lossy makePublishKit instead.
 *
 * @template T
 * @param {EachTopic<T> & LatestTopic<T>} topic needs to be near in order to
 * preserve subscription timings.  TODO: drop `LatestTopic<T>` requirement
 * @returns {EachTopic<T> & LatestTopic<T>}
 */
export const makePinnedHistoryTopic = topic => {
  // Such losslessness inhibits GC, which is why we're moving away from it.

  // We need to take an immediate snapshot of the topic's current state.
  const pinnedPubList = topic.subscribeAfter();

  return Far('PinnedHistoryTopic', {
    subscribeAfter: async (publishCount = -1n) => {
      if (publishCount === -1n) {
        return pinnedPubList;
      }
      return topic.subscribeAfter(publishCount);
    },
    getUpdateSince: async (updateCount = undefined) => {
      // TODO: Build this out of EachTopic<T>.
      return topic.getUpdateSince(updateCount);
    },
  });
};
harden(makePinnedHistoryTopic);
