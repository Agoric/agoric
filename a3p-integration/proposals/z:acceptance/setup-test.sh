#!/bin/bash

set -o errexit -o pipefail

# shellcheck disable=SC1091
source /usr/src/upgrade-test-scripts/env_setup.sh

set -o xtrace

AGORIC_HOME="$HOME/.agoric"

CHAIN_ID="$(jq --raw-output '.chain_id' < "$AGORIC_HOME/config/genesis.json")"
IP_ADDRESS="$(hostname --ip-address)"
NODE_ID="$(agd tendermint show-node-id)"

echo -n "{\"chainName\": \"$CHAIN_ID\", \"rpcAddrs\": [\"$IP_ADDRESS:26657\"], \"gci\": \"$IP_ADDRESS:26657/genesis\", \"peers\":[\"$NODE_ID@$IP_ADDRESS:26656\"], \"seeds\":[]}" > "$MESSAGE_FILE_PATH"

SNAPSHOT_INTERVAL="$(($(jq --raw-output '.SyncInfo.latest_block_height' < "$STATUS_FILE") + 2))"
sed "s/^snapshot-interval\s*=.*/snapshot-interval = $SNAPSHOT_INTERVAL/" \
  "$AGORIC_HOME/config/app.toml" \
  --in-place
