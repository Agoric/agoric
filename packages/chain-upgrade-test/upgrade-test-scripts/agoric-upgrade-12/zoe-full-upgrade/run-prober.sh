#!/bin/bash

. ./upgrade-test-scripts/env_setup.sh

set -euo pipefail

here='upgrade-test-scripts/agoric-upgrade-12/zoe-full-upgrade'

agd --chain-id=agoriclocal \
  tx gov submit-proposal swingset-core-eval \
  ${here}/zcf-upgrade-permit.json ${here}/run-prober-script.js \
  --title="Run Prober" --description="run prober" \
  --deposit=10000000ubld \
  --gas=auto --gas-adjustment=1.2 \
  --yes -o json --from=validator --keyring-backend=test -b block

agd --chain-id=agoriclocal query gov proposals --output json | \
        jq -c '.proposals[] | [.proposal_id,.voting_end_time,.status]';

voteLatestProposalAndWait
