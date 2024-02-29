import test from 'ava';
import { getIncarnation } from './tools/vat-status.js';

test(`verify Zoe vat incarnation`, async t => {
  const incarantion = await getIncarnation('zoe');
  t.is(incarantion, 1);
});
