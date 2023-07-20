// @ts-check
import '@endo/init';
import test from 'ava';
import { fc } from '@fast-check/ava';
import { extractStreamCellValue } from '../src/lib/vstorage.js';

const arbStreamCell = fc.record({
  blockHeight: fc.nat().map(n => `${n}`),
  values: fc.array(fc.string(), { minLength: 1 }),
});

const noDataAtPath = fc.constant({ value: '' });
const arbQueryDataResponse = fc.oneof(
  noDataAtPath,
  arbStreamCell.map(cell => ({
    value: JSON.stringify(cell),
  })),
);

test('extractStreamCellValue() handles empty response', t => {
  const resp = { value: '' };
  t.throws(() => extractStreamCellValue(resp), {
    message: /no StreamCell values/,
  });
});

test('extractStreamCellValue() handles all valid non-empty responses', t => {
  fc.assert(
    fc.property(
      arbQueryDataResponse.filter(resp => resp.value !== ''),
      resp => {
        const actual = extractStreamCellValue(resp);
        t.is(typeof actual, 'string');
      },
    ),
  );
});
