import { test } from '../tools/prepare-test-env-ava.js';
import {
  insistVatID,
  makeVatID,
  insistDeviceID,
  makeDeviceID,
} from '../src/lib/id.js';

test('makeVatID', async t => {
  t.is(makeVatID(0), 'v0');
  t.is(makeVatID(1), 'v1');
  t.is(makeVatID(100n ** 10n), 'v100000000000000000000');

  t.throws(() => makeVatID());
  t.throws(() => makeVatID(-1));
  t.throws(() => makeVatID(3.14));
  t.throws(() => makeVatID('3'));
  t.throws(() => makeVatID('3n'));
});

test('insistVatId', async t => {
  t.notThrows(() => insistVatID('v0'));
  t.notThrows(() => insistVatID('v1'));
  t.notThrows(() => insistVatID('v100000000000000000000'));
  t.notThrows(() => insistVatID('v0001'));

  t.throws(() => insistVatID(null));
  t.throws(() => insistVatID(undefined));
  t.throws(() => insistVatID(''));
  t.throws(() => insistVatID('v'));
  t.throws(() => insistVatID('v-1'));
  t.throws(() => insistVatID('v3.14'));
  t.throws(() => insistVatID('v100n'));
});

test('makeDeviceID', async t => {
  t.is(makeDeviceID(0), 'd0');
  t.is(makeDeviceID(1), 'd1');
  t.is(makeDeviceID(100n ** 10n), 'd100000000000000000000');

  t.throws(() => makeDeviceID());
  t.throws(() => makeDeviceID(-1));
  t.throws(() => makeDeviceID(3.14));
  t.throws(() => makeDeviceID('3'));
  t.throws(() => makeDeviceID('3n'));
});

test('insistDeviceID', async t => {
  t.notThrows(() => insistDeviceID('d0'));
  t.notThrows(() => insistDeviceID('d1'));
  t.notThrows(() => insistDeviceID('d100000000000000000000'));
  t.notThrows(() => insistDeviceID('d0001'));

  t.throws(() => insistDeviceID(null));
  t.throws(() => insistDeviceID(undefined));
  t.throws(() => insistDeviceID(''));
  t.throws(() => insistDeviceID('d'));
  t.throws(() => insistDeviceID('d-1'));
  t.throws(() => insistDeviceID('d3.14'));
  t.throws(() => insistDeviceID('d100n'));
});
