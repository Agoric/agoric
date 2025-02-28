#!/bin/bash
set -o errexit -o nounset -o pipefail

DIRECTORY_PATH="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

if ! test -z "$MESSAGE_FILE_PATH"; then
  # make sure the follower has not crashed
  node "$DIRECTORY_PATH/wait-for-follower.mjs" '^(ready)|(exit code \d+)$' | grep --extended-regexp --silent "^ready$"
fi

# Place here any test that should be executed using the executed proposal.
# The effects of this step are not persisted in further proposal layers.

# segregate so changing these does not invalidate the proposal image
# à la https://github.com/Agoric/agoric-3-proposals/pull/213
cd test

# test the state right after the previous proposals
yarn ava initial.test.js

# XXX some of these tests have path dependencies so no globs
yarn ava core-eval.test.js

scripts/test-vaults.ts

echo ACCEPTANCE TESTING recorded instances
yarn ava recorded-retired.test.js

echo ACCEPTANCE TESTING kread
yarn ava kread.test.js

echo ACCEPTANCE TESTING valueVow
yarn ava valueVow.test.js

echo ACCEPTANCE TESTING wallet
yarn ava wallet.test.js

echo ACCEPTANCE TESTING psm
yarn ava psm.test.js

echo ACCEPTANCE TESTING vaults
yarn ava vaults.test.js

echo ACCEPTANCE TESTING governance
yarn ava governance.test.js

echo ACCEPTANCE TESTING stake BLD
# XXX correct misnaming
# UNTIL https://github.com/Agoric/agoric-3-proposals/issues/212
DELEGATOR_ADDRRESS=$VALIDATORADDR
VALIDATOR_ADDRESS=$(agd query staking delegations "$DELEGATOR_ADDRRESS" --output json | jq -r ".delegation_responses[0].delegation.validator_address")
export VALIDATOR_ADDRESS
echo "VALIDATOR_ADDRESS: $VALIDATOR_ADDRESS from delegator $DELEGATOR_ADDRRESS (named 'VALIDATORADDR' in env)"

yarn ava stakeBld.test.js

if ! test -z "$MESSAGE_FILE_PATH"; then
  if [[ "$(cat "$MESSAGE_FILE_PATH")" == "ready" ]]; then
    echo -n "stop" > "$MESSAGE_FILE_PATH"
  fi

  exit_message="$(node "$DIRECTORY_PATH/wait-for-follower.mjs" "^exit code \d+$")"
  echo "follower test result: $exit_message"
  echo "$exit_message" | grep --extended-regexp --silent "^exit code 0$"
fi

echo ACCEPTANCE TESTING state sync
./state-sync-snapshots-test.sh
./genesis-test.sh
