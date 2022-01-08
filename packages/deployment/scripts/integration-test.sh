#! /bin/bash
set -ueo pipefail

real0=$(readlink "${BASH_SOURCE[0]}" || echo "${BASH_SOURCE[0]}")
thisdir=$(cd "$(dirname -- "$real0")" > /dev/null && pwd -P)

export NETWORK_NAME=${NETWORK_NAME-localtest}

mkdir -p "$NETWORK_NAME/setup"
cd "$NETWORK_NAME/setup"

export AG_SETUP_COSMOS_HOME=${AG_SETUP_COSMOS_HOME-$PWD}

# Speed up the docker deployment by pre-mounting /usr/src/agoric-sdk.
DOCKER_VOLUMES="$(cd "$thisdir/../../.." > /dev/null && pwd -P):/usr/src/agoric-sdk" \
  "$thisdir/docker-deployment.cjs" > deployment.json

# Set up the network from our above deployment.json.
"$thisdir/setup.sh" init --noninteractive

# Go ahead and bootstrap with detailed debug logging.
AG_COSMOS_START_ARGS="--log_level=info --trace-store=.ag-chain-cosmos/data/kvstore.trace" \
  "$thisdir/setup.sh" bootstrap ${1+"$@"}
