#!/bin/sh

# "agoric follow" steps need to be cancelled manually, so these steps should be
# copy-pasted rather than run as a script for best results.

if [ -z "$AGORIC_NET" ]; then
    echo "AGORIC_NET env not set"
    echo
    echo "e.g. AGORIC_NET=ollinet (or export to save typing it each time)"
    echo
    echo "To test locally, AGORIC_NET=local and have the following running:
# freshen sdk
yarn install && yarn build

# local chain running with wallet provisioned
packages/inter-protocol/scripts/start-local-chain.sh
"
    exit 1
fi

set -x

# Accept invitation to admin an oracle
ORACLE_OFFER=$(mktemp -t agops.XXX)
bin/agops oracle accept >|"$ORACLE_OFFER"
jq ".body | fromjson" <"$ORACLE_OFFER"
agoric wallet send --offer "$ORACLE_OFFER" --from gov1 --keyring-backend="test"
ORACLE_OFFER_ID=$(jq -r ".body | fromjson | .offer.id" <"$ORACLE_OFFER")

# verify the offerId is readable from chain history
agoric wallet show --from gov1 --keyring-backend="test"

# repeat for oracle2
ORACLE_OFFER=$(mktemp -t agops.XXX)
bin/agops oracle accept >|"$ORACLE_OFFER"
jq ".body | fromjson" <"$ORACLE_OFFER"
agoric wallet send --offer "$ORACLE_OFFER" --from gov2 --keyring-backend="test"
ORACLE2_OFFER_ID=$(jq -r ".body | fromjson | .offer.id" <"$ORACLE_OFFER")

### Now we have the continuing invitationMakers saved in the wallets

# Use invitation result, with continuing invitationMakers to propose a vote
PROPOSAL_OFFER=$(mktemp -t agops.XXX)
bin/agops oracle pushPriceRound --price 5500000 --roundId 1 --oracleAdminAcceptOfferId "$ORACLE_OFFER_ID" >|"$PROPOSAL_OFFER"
jq ".body | fromjson" <"$PROPOSAL_OFFER"
agoric wallet send --offer "$PROPOSAL_OFFER" --from gov1 --keyring-backend="test"

# submit another price in the round from the second oracle
PROPOSAL_OFFER=$(mktemp -t agops.XXX)
bin/agops oracle pushPriceRound --price 5500000 --roundId 1 --oracleAdminAcceptOfferId "$ORACLE2_OFFER_ID" >|"$PROPOSAL_OFFER"
jq ".body | fromjson" <"$PROPOSAL_OFFER"
agoric wallet send --offer "$PROPOSAL_OFFER" --from gov2 --keyring-backend="test"

## Additional validation

# verify that the offer was satisfied
echo "Offer $ORACLE_OFFER_ID should have numWantsSatisfied: 1"
agoric wallet show --from gov1 --keyring-backend="test"

# verify feed publishing
agd query vstorage keys published.priceFeed

# verify that the round started
agoric follow :published.priceFeed.ATOM-USD_price_feed.latestRound

# Set it to $13 per ATOM
# second round, first oracle
PROPOSAL_OFFER=$(mktemp -t agops.XXX)
bin/agops oracle pushPriceRound --price 120000000 --roundId 2 --oracleAdminAcceptOfferId "$ORACLE_OFFER_ID" >|"$PROPOSAL_OFFER"
agoric wallet send --offer "$PROPOSAL_OFFER" --from gov1 --keyring-backend="test"
# second round, second oracle
PROPOSAL_OFFER=$(mktemp -t agops.XXX)
bin/agops oracle pushPriceRound --price 14000000 --roundId 2 --oracleAdminAcceptOfferId "$ORACLE2_OFFER_ID" >|"$PROPOSAL_OFFER"
agoric wallet send --offer "$PROPOSAL_OFFER" --from gov2 --keyring-backend="test"

# see new price
agoric follow :published.priceFeed.ATOM-USD_price_feed
