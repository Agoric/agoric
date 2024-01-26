// From https://github.com/Agoric/agoric-sdk/pull/6903#discussion_r1098067133

// eslint-disable-next-line import/order
import { test } from './prepare-test-env-ava.js';

// eslint-disable-next-line import/order
import { M } from '@endo/patterns';

import { makeScalarMapStore } from '@agoric/store';
import { makeScalarBigMapStore } from '../src/vat-data-bindings.js';

test('scalar maps should reject non-scalar keys', t => {
  const bigMap = makeScalarMapStore('dummy', { keyShape: M.key() });
  t.throws(() => bigMap.init(harden({ label: 'not a scalar' }), 'val'), {
    message:
      /A "copyRecord" cannot be a scalar key: \{"label":"not a scalar"\}/,
  });
});

test('scalar big maps should reject non-scalar keys', t => {
  const bigMap = makeScalarBigMapStore('dummy', { keyShape: M.key() });
  t.throws(() => bigMap.init(harden({ label: 'not a scalar' })), {
    message:
      /A "copyRecord" cannot be a scalar key: \{"label":"not a scalar"\}/,
  });
});
