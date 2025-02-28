#!/bin/bash
set -euo pipefail

# XXX the from address is gov1 but using that causes:
# Error: gov1 is not a valid name or address: decoding bech32 failed: invalid bech32 string length 4
# Usage:
#   agd keys show [name_or_address [name_or_address...]] [flags]

echo CLI test accepting operator invitation
ACCEPT_OFFER_ID=fastUsdcTestAccept
yarn fast-usdc operator accept --offerId $ACCEPT_OFFER_ID >| accept.json
cat accept.json
yarn agoric wallet send --offer accept.json --from agoric1ee9hr0jyrxhy999y755mp862ljgycmwyp4pl7q --keyring-backend test
# UNTIL https://github.com/Agoric/agoric-sdk/issues/10891
# ACCEPT_OFFER_ID=$(agoric wallet extract-id --offer accept.json)

yarn fast-usdc operator attest --previousOfferId="$ACCEPT_OFFER_ID" --forwardingChannel=foo --recipientAddress=agoric1foo --blockHash=0xfoo --blockNumber=1 --blockTimestamp=1632340000 --chainId=3 --amount=123 --forwardingAddress=noble1foo --sender 0xfoo --txHash=0xtx >| attest.json
cat attest.json
yarn agoric wallet send --offer attest.json --from agoric1ee9hr0jyrxhy999y755mp862ljgycmwyp4pl7q --keyring-backend test

# The data above are bogus and result in errors in the logs:
# SwingSet: vat: v72: ----- TxFeed.11  8 publishing evidence { aux: { forwardingChannel: 'foo', recipientAddress: 'agoric1foo' }, blockHash: '0xfoo', blockNumber: 1n, chainId: 3, tx: { amount: 123n, forwardingAddress: 'noble1foo', sender: '0xfoo' }, txHash: '0xtx' } []
# SwingSet: vat: v72: ----- Advancer.15  2 Advancer error: (Error#4)
# SwingSet: vat: v72: Error#4: Data too short
