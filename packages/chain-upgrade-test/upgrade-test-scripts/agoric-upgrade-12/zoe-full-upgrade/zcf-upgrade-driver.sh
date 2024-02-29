#!/bin/bash

. ./upgrade-test-scripts/env_setup.sh

set -euo pipefail

# This shows how to upgrade Zoe and ZCF on a running chain. It presumes that
# the bundles for Zoe and ZCF have been installed, and their hashes updated in
# zcf-upgrade-script.js. Instructions for updating the bundles are available
# in ../actions.sh

here='upgrade-test-scripts/agoric-upgrade-12/zoe-full-upgrade'

agd --chain-id=agoriclocal \
  tx gov submit-proposal swingset-core-eval \
  ${here}/zcf-upgrade-permit.json ${here}/zcf-upgrade-script.js \
  --title="Zoe Upgrade" --description="zoe upgrade test" \
  --deposit=10000000ubld \
  --gas=auto --gas-adjustment=1.2 \
  --yes -o json --from=validator --keyring-backend=test -b block

agd --chain-id=agoriclocal query gov proposals --output json | \
        jq -c '.proposals[] | [.proposal_id,.voting_end_time,.status]';

voteLatestProposalAndWait
