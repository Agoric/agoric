#!/bin/bash

set -o errexit -o pipefail -o xtrace

# shellcheck disable=SC1091
source /usr/src/upgrade-test-scripts/env_setup.sh

SNAPSHOT_INTERVAL="$(($(jq --raw-output '.SyncInfo.latest_block_height' < "$STATUS_FILE") + 2))"
sed "s/^snapshot-interval\s*=.*/snapshot-interval = $SNAPSHOT_INTERVAL/" \
 "$HOME/.agoric/config/app.toml" \
 --in-place
