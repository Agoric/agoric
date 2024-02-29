#!/bin/bash

. ./upgrade-test-scripts/env_setup.sh

# ensure there's only uist
test_val "$(agd q bank balances agoric1megzytg65cyrgzs6fvzxgrcqvwwl7ugpt62346 -o json | jq -r '.balances | length')" "1"
test_val "$(agd q bank balances agoric1megzytg65cyrgzs6fvzxgrcqvwwl7ugpt62346 -o json | jq -r '.balances[0].denom')" "uist"


# test wallets are provisioned
test_not_val "$(agd q vstorage data published.wallet.$GOV1ADDR -o json | jq -r .value)" "" "ensure gov1 provisioned"
test_not_val "$(agd q vstorage data published.wallet.$GOV2ADDR -o json | jq -r .value)" "" "ensure gov2 provisioned"
test_not_val "$(agd q vstorage data published.wallet.$GOV3ADDR -o json | jq -r .value)" "" "ensure gov3 provisioned"
