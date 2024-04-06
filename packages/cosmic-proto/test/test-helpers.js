// @ts-check
import test from 'ava';

import { cosmos } from '../dist/codegen/cosmos/bundle.js';
import {
  getSigningAgoricClientOptions,
  makeProtoConverter,
  typedJson,
} from '../dist/index.js';

const mockMsgSend = {
  fromAddress: 'agoric1from',
  toAddress: 'agoric1to',
  amount: [{ denom: 'ucosm', amount: '1' }],
};

test('MsgSend', t => {
  t.like(cosmos.bank.v1beta1.MsgSend.toProtoMsg(mockMsgSend), {
    typeUrl: '/cosmos.bank.v1beta1.MsgSend',
  });
});

test('registry', t => {
  const { registry } = getSigningAgoricClientOptions();
  t.truthy(registry.lookupType('/cosmos.bank.v1beta1.MsgSend'));

  const proto = registry.encodeAsAny({
    typeUrl: '/cosmos.bank.v1beta1.MsgSend',
    value: mockMsgSend,
  });
  t.like(proto, {
    typeUrl: '/cosmos.bank.v1beta1.MsgSend',
  });

  t.deepEqual(registry.decode(proto), mockMsgSend);
});

test('normalize', t => {
  const { registry } = getSigningAgoricClientOptions();
  const convert = makeProtoConverter(registry);

  const protoJson = {
    '@type': '/cosmos.bank.v1beta1.MsgSend',
    ...mockMsgSend,
  };

  const proto = registry.encodeAsAny({
    typeUrl: '/cosmos.bank.v1beta1.MsgSend',
    value: mockMsgSend,
  });
  t.deepEqual(convert(proto), protoJson);
  const { '@type': _, ...value } = protoJson;
  t.deepEqual(registry.decode(proto), value);
});

test('typedJson', t => {
  const address = 'addr';
  const qabr = typedJson('/cosmos.bank.v1beta1.QueryAllBalancesRequest', {
    address,
    // @ts-expect-error invalid field
    other: 3,
  });
  t.deepEqual(qabr, {
    '@type': '/cosmos.bank.v1beta1.QueryAllBalancesRequest',
    address,
    other: 3, // retained because there's no runtime validation
  });

  const msgSend = typedJson('/cosmos.bank.v1beta1.MsgSend', {
    fromAddress: address,
    toAddress: address,
    amount: [{ denom: 'ucosm', amount: '1' }],
    // @ts-expect-error invalid field
    other: 3,
  });
  t.deepEqual(msgSend, {
    '@type': '/cosmos.bank.v1beta1.MsgSend',
    fromAddress: address,
    toAddress: address,
    amount: [{ denom: 'ucosm', amount: '1' }],
    other: 3, // retained because there's no runtime validation
  });
});
