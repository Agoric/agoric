#!/bin/bash

. ./upgrade-test-scripts/env_setup.sh

# ensure there's nothing in the provision pool
test_val "$(agd q bank balances agoric1megzytg65cyrgzs6fvzxgrcqvwwl7ugpt62346 -o json | jq -r '.balances | length')" "0" "ensure nothing is in provisionpool"


# Test no smart wallet for
test_val "$(agd q vstorage data published.wallet.$GOV1ADDR -o json | jq -r .value)" "" "ensure gov1 not provisioned"
test_val "$(agd q vstorage data published.wallet.$GOV2ADDR -o json | jq -r .value)" "" "ensure gov2 not provisioned"
test_val "$(agd q vstorage data published.wallet.$GOV3ADDR -o json | jq -r .value)" "" "ensure gov3 not provisioned"

waitForBlock 2