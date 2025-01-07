// @ts-check
import test from 'ava';

import { assertOfferResult } from '../../src/assertOfferResult.js';

test('assertOfferResult', async t => {
  /** @type {UserSeat} */
  const mockSeat = {
    // @ts-expect-error mock
    getOfferResult: () => 'result',
  };
  await t.notThrowsAsync(async () => assertOfferResult(mockSeat, 'result'));
  await t.throwsAsync(async () => assertOfferResult(mockSeat, 'not result'), {
    message: /offerResult (.*) did not equal expected: .*/,
  });
});
