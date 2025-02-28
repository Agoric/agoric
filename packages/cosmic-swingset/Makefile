# This Makefile is designed to be used with `NODE_OPTIONS=--inspect-brk` to
# debug the main program you're running.  It clears `$NODE_OPTIONS` while
# running incidental Node.js programs to avoid starting debuggers you probably
# don't want.

REPOSITORY = ghcr.io/agoric/cosmic-swingset
CHAIN_ID = agoriclocal
FAUCET_PORT = 7000
FAUCET_WALLET = provision
FAUCET_ADDRESS = localhost
ROSETTA_PORT = 8080

INITIAL_HEIGHT = 17
GENESIS_TIME = $(shell TZ=UTC date +%Y-%m-%dT%H:%M:%SZ)
VOTING_PERIOD = 45s

ECONOMY_TEMPLATE = economy-template.json
ECONOMY_PROPOSALS = t1/economy-proposals.json

EVAL_PERMIT = test/gov-permit.json
EVAL_CODE = test/gov-code.js
EVAL_DEPOSIT = 1000000ubld
VOTE_PROPOSAL = 1
VOTE_OPTION = yes

SDK_ROOT = $(shell cd ../.. >/dev/null && pwd)

# For deep (cross-vat) stacks, try...
# DEBUG ?= SwingSet:ls,SwingSet:vat,track-turns
# or to get kernel messages: SwingSet:ls,SwingSet:vat,SwingSet
DEBUG ?= SwingSet:ls,SwingSet:vat
AG_SOLO = DEBUG=$(DEBUG) $(shell cd ../solo/bin && pwd)/ag-solo
AGC = DEBUG=$(DEBUG) PATH="$$PWD/bin:$$PATH" "$(SDK_ROOT)/bin/agd"
AGCH = "$(SDK_ROOT)/bin/agd"

SHELL = bash

default: all

# By default, make the fake chain in scenario3 produce
# "blocks" as soon as they come in.
FAKE_CHAIN_DELAY = 0

NUM_SOLOS?=1
BASE_PORT?=8000

OTEL_EXPORTER_PROMETHEUS_PORT = 9464
SOLO_OTEL_EXPORTER_PROMETHEUS_PORT = 9465
GAS_ADJUSTMENT = 1.2

AGC_START_ARGS =

BIN := $(shell echo $${GOBIN-$${GOPATH-$$HOME/go}/bin})

EVAL_CLEAN=$(EVAL_CODE)-clean.js

$(EVAL_CLEAN): $(EVAL_CODE)
	./scripts/clean-core-eval.js $< >$@.t || { rm -f $@.t; exit 1; }
	mv $@.t $@

INTER_PROTO=../inter-protocol

start-committee: $(INTER_PROTO)/gov-econ-committee.js
	make EVAL_CODE=$(INTER_PROTO)/gov-econ-committee.js \
		EVAL_PERMIT=$(INTER_PROTO)/gov-econ-committee-permit.json \
		VOTE_PROPOSAL=$(VOTE_PROPOSAL) scenario2-core-eval scenario2-vote


start-amm-etc: $(INTER_PROTO)/gov-amm-vaults-etc.js
	make EVAL_CODE=$(INTER_PROTO)/gov-amm-vaults-etc.js \
		EVAL_PERMIT=$(INTER_PROTO)/gov-amm-vaults-etc-permit.json \
		VOTE_PROPOSAL=$(VOTE_PROPOSAL) scenario2-core-eval scenario2-vote

gov-q:
	$(AGCH) query gov proposals --output json | \
		jq -c '.proposals[] | [if .proposal_id == null then .id else .proposal_id end,.voting_end_time,.status]'

# This probably shouldn't install, but that's what published instructions
# expect.
all: build-chain install-nobuild

client: build-helper install-nobuild

install-nobuild: install-local install-agd

install: all install-nobuild

scenario0-setup:
	mkdir -p t9
	rm -rf t9/$(BASE_PORT)

scenario0-run scenario0-run-client:
	AG_SOLO_BASEDIR=$$PWD/t9/$(BASE_PORT) $(AG_SOLO) setup --webport=$(BASE_PORT)
scenario0-run-chain:
	@echo 'We use the Agoric testnet, not a local chain.'

scenario1-setup: scenario0-setup
scenario1-run-chain:
	@test "`uname -s`" = Linux || \
		{ echo 'Must run under Linux; use "(cd ../deployment && make docker-build) && docker/ag-setup-cosmos bootstrap"'; exit 1; }
	AG_SETUP_COSMOS_HOME=t8 ../deployment/ag-setup-cosmos bootstrap

scenario1-run-client:
	AG_SOLO_BASEDIR=$$PWD/t9/$(BASE_PORT) $(AG_SOLO) setup --network-config=http://localhost:8001/network-config --webport=$(BASE_PORT)

BOOT_COINS=1000000000000000ubld,500000000000000uist,100provisionpass,100sendpacketpass,1000000000000ibc/toyusdc,1000000000000ibc/toyatom

# Deprecated.
scenario2-setup-nobuild: scenario2-setup

scenario2-setup:
	rm -rf t1
	mkdir -p t1/bootstrap
	# Init the chain node.
	$(AGCH) --home=t1/n0 init scenario2-chain --chain-id=$(CHAIN_ID)
	# Init all the ag-solos, ensuring only the first one uses the $SOLO_MNEMONIC, if any.
	set -e; \
		for port in `seq $(BASE_PORT) $$(($(BASE_PORT) + $(NUM_SOLOS) - 1))`; do \
			NODE_OPTIONS= $(AG_SOLO) init t1/$$port --webport=$$port; \
			if [ -z $$PRIMARY_ADDRESS ]; then \
				echo "Getting PRIMARY_ADDRESS from agsolo config"; \
				export PRIMARY_ADDRESS=$$(cat t1/$$port/ag-cosmos-helper-address); \
			fi; \
	  done; \
	  sed -e "s!@PRIMARY_ADDRESS@!$$PRIMARY_ADDRESS!g" '$(ECONOMY_TEMPLATE)' > '$(ECONOMY_PROPOSALS)'
	# Create the bootstrap account.
	$(AGCH) --home=t1/bootstrap keys add bootstrap --keyring-backend=test
	$(AGCH) --home=t1/bootstrap keys show -a bootstrap --keyring-backend=test > t1/bootstrap-address
	$(AGCH) --home=t1/n0 add-genesis-account `cat t1/bootstrap-address` $(BOOT_COINS)
	# Create the (singleton) chain node.
	$(AGCH) --home=t1/n0 --keyring-dir=t1/bootstrap gentx --keyring-backend=test bootstrap 73000000ubld --chain-id=$(CHAIN_ID)
	$(AGCH) --home=t1/n0 collect-gentxs
	$(AGCH) --home=t1/n0 validate-genesis
	NODE_OPTIONS= ../agoric-cli/bin/agoric set-defaults --enable-cors --export-metrics ag-chain-cosmos t1/n0/config
	# Set the chain address in all the ag-solos.
	jq --arg gen $(GENESIS_TIME) --arg init $(INITIAL_HEIGHT) --arg votepd $(VOTING_PERIOD) \
		'. * { genesis_time: $$gen, initial_height: $$init, app_state: { gov: { voting_params: { voting_period: $$votepd }}}}' \
		t1/n0/config/genesis.json > t1/n0/config/genesis2.json
	mv t1/n0/config/genesis2.json t1/n0/config/genesis.json
	$(MAKE) set-local-gci-ingress

t1/decentral-economy-config.json: $(ECONOMY_PROPOSALS)
	jq -s '.[0] * { coreProposals: .[1] }' \
		../vm-config/decentral-core-config.json \
		'$(ECONOMY_PROPOSALS)' > t1/decentral-economy-config.json

scenario2-run-chain-economy: t1/decentral-economy-config.json
	echo "DEPRECATED use: CHAIN_BOOTSTRAP_VAT_CONFIG=@agoric/vm-config/decentral-itest-vaults-config.json scenario2-run-chain"
	CHAIN_BOOTSTRAP_VAT_CONFIG="$$PWD/t1/decentral-economy-config.json" \
		$(MAKE) scenario2-run-chain

# We want to use the same configuration that will be deployed to the next
# devnet.agoric.net so that developers can test their code against it locally.
scenario2-run-chain: ../vm-config/decentral-devnet-config.json
	CHAIN_BOOTSTRAP_VAT_CONFIG="$${CHAIN_BOOTSTRAP_VAT_CONFIG-$$PWD/../vm-config/decentral-devnet-config.json}" \
		OTEL_EXPORTER_PROMETHEUS_PORT=$(OTEL_EXPORTER_PROMETHEUS_PORT) \
		$(AGC) --home=t1/n0 start --log_level=warn $(AGC_START_ARGS)

# Run a chain with an explicit halt.
BLOCKS_TO_RUN=3
scenario2-run-chain-to-halt: t1/decentral-economy-config.json
	CHAIN_BOOTSTRAP_VAT_CONFIG="$$PWD/t1/decentral-economy-config.json" \
		$(AGC) --home=t1/n0 start --log_level=warn --halt-height=$$(($(INITIAL_HEIGHT) + $(BLOCKS_TO_RUN))); \
		status=$$?; \
		echo "chain halt status=$$status"; \
		test "$$status" -gt 1
	echo ran to $(INITIAL_HEIGHT) + $(BLOCKS_TO_RUN)

# Blow away all client state to try again without resetting the chain.
scenario2-reset-client:
	rm -rf t1/$(BASE_PORT)
	$(AG_SOLO) init t1/$(BASE_PORT) --webport=$(BASE_PORT)
	$(MAKE) set-local-gci-ingress

# Declare that the BASE_PORT should draw fees from its owner.
scenario2-use-fee-account: t1/$(BASE_PORT)/owner-address
	cp $< t1/$(BASE_PORT)/cosmos-fee-account

# Declare that the BASE_PORT should use an egress corresponding to its owner.
scenario2-use-client-account: t1/$(BASE_PORT)/owner-address
	cp $< t1/$(BASE_PORT)/cosmos-client-account

scenario2-run-rosetta-ci: wait-for-rosetta
	./scripts/run-rosetta-ci.sh

t1/$(BASE_PORT)/owner-address:
	rm -rf t1/$(BASE_PORT)/owner
	$(AGCH) --home=t1/$(BASE_PORT)/owner keys --keyring-backend=test add owner | jq -r .address > $@.tmp
	mv $@.tmp $@

# Provision and start a client of ag-solo
scenario2-run-client: t1-provision-one-with-powers t1-start-ag-solo

# Provision the ag-solo from an provisionpass-holding address (idempotent).
AGORIC_POWERS = agoric.ALL_THE_POWERS
SOLO_COINS = 13000000ubld,12345000000uist,1122000000ibc/toyusdc,3344000000ibc/toyatom
COSMOS_RPC_HOST = localhost
COSMOS_RPC_PORT = 26657
wait-for-cosmos:
	@echo -n "Waiting for $(COSMOS_RPC_HOST):$(COSMOS_RPC_PORT) to come live..."
	@while true; do \
	  block=$$(curl -s http://$(COSMOS_RPC_HOST):$(COSMOS_RPC_PORT)/status | jq -r .result.sync_info.latest_block_height); \
		if test -n "$$block" && test "$$block" -lt 1; then \
		  true; \
		elif test -z "$$start"; then \
		  start=$$block; \
		elif test $$block -gt $$start; then \
		  break; \
		fi; \
		echo -n '.'; \
		sleep 1; \
	done
	@echo ' done!'

wait-for-rosetta: wait-for-cosmos
	@echo -n "Waiting for $(COSMOS_RPC_HOST):$(ROSETTA_PORT) to come live..."
	@while true; do \
	  networks=$$(curl -s -X POST http://$(COSMOS_RPC_HOST):$(ROSETTA_PORT)/network/list --data '{ "metadata": {} }'); \
		if ! test -z "$$networks"; then \
		  break; \
		fi; \
		echo -n '.'; \
		sleep 1; \
	done
	@echo ' done!'

t1-provision-one-with-powers: wait-for-cosmos
	@addrfile=t1/$(BASE_PORT)/cosmos-client-account; \
		test -f $$addrfile || addrfile=t1/$(BASE_PORT)/ag-cosmos-helper-address; \
		addr=$$(cat $$addrfile); \
	  $(AGCH) --home=t1/bootstrap query swingset egress $$addr --chain-id=$(CHAIN_ID) || \
		{ while ! $(AGCH) --home=t1/bootstrap tx bank send --keyring-backend=test --from=bootstrap \
		  --gas=auto --gas-adjustment=$(GAS_ADJUSTMENT) --broadcast-mode=block --yes --chain-id=$(CHAIN_ID) \
			bootstrap $$addr $(SOLO_COINS); do sleep 2; done && \
	  $(AGCH) --home=t1/bootstrap tx swingset provision-one --keyring-backend=test --from=bootstrap \
		  --gas=auto --gas-adjustment=$(GAS_ADJUSTMENT) --broadcast-mode=block --yes --chain-id=$(CHAIN_ID) \
		  t1/$(BASE_PORT) $$addr $(AGORIC_POWERS) -ojson | tee /dev/stderr | grep -q '"code":0'; }

# Send some USDC to the vbank/provision module account where it can be traded for IST.
fund-provision-pool:
# The agoric1megzy… address is the account of the provisioning pool.
# The mint limit is 1000 IST and each wallet gets 0.25 IST when
# provisioned, so make room for 400 accounts with 100 USDC which mints 100 IST.
	$(MAKE) ACCT_ADDR=agoric1megzytg65cyrgzs6fvzxgrcqvwwl7ugpt62346 FUNDS=1000000000ibc/toyusdc fund-acct

fund-acct:
	$(AGCH) \
	  --home=t1/bootstrap --keyring-backend=test --from=bootstrap \
	  tx bank send bootstrap $(ACCT_ADDR) $(FUNDS) \
	  --gas=auto --gas-adjustment=$(GAS_ADJUSTMENT) --broadcast-mode=block --yes --chain-id=$(CHAIN_ID)

provision-acct:
	$(AGCH) --chain-id=$(CHAIN_ID) \
	  --home=t1/bootstrap --keyring-backend=test --from=bootstrap \
	  tx swingset provision-one t1/$(BASE_PORT) $(ACCT_ADDR) SMART_WALLET \
	  --gas=auto --gas-adjustment=$(GAS_ADJUSTMENT) --broadcast-mode=block --yes

provision-my-acct:
	$(AGCH) --chain-id=$(CHAIN_ID) \
	  --home t1/8000/ag-cosmos-helper-statedir --keyring-backend=test --from=ag-solo \
	  tx swingset provision-one t1/$(BASE_PORT) $(ACCT_ADDR) SMART_WALLET \
	  --gas=auto --gas-adjustment=$(GAS_ADJUSTMENT) --broadcast-mode=block --yes

FROM_KEY=bootstrap
SIGN_MODE=
wallet-action: wait-for-cosmos
	$(AGCH) \
	  --home=t1/bootstrap --keyring-backend=test --from=$(FROM_KEY) $(SIGN_MODE)\
	  tx swingset wallet-action '{"give": 10, "want": 1}' \
	  --gas=auto --gas-adjustment=$(GAS_ADJUSTMENT) --broadcast-mode=block --yes --chain-id=$(CHAIN_ID)

wallet-action-gen:
	$(AGCH) --chain-id=$(CHAIN_ID) \
	  --home=t1/bootstrap --keyring-backend=test --from=$$(cat t1/bootstrap-address) $(SIGN_MODE)\
	  tx swingset wallet-action '{"action":1}' \
	  --generate-only --offline

t1-provision-one: wait-for-cosmos
	@addrfile=t1/$(BASE_PORT)/cosmos-client-account; \
		test -f $$addrfile || addrfile=t1/$(BASE_PORT)/ag-cosmos-helper-address; \
		addr=$$(cat $$addrfile); \
	  $(AGCH) --home=t1/bootstrap query swingset egress $$addr --chain-id=$(CHAIN_ID) || \
		{ $(AGCH) --home=t1/bootstrap tx bank send --keyring-backend=test --from=bootstrap \
		  --gas=auto --gas-adjustment=$(GAS_ADJUSTMENT) --broadcast-mode=block --yes --chain-id=$(CHAIN_ID) \
			bootstrap $$addr $(SOLO_COINS) && \
	  $(AGCH) --home=t1/bootstrap tx swingset provision-one --keyring-backend=test --from=bootstrap \
		  --gas=auto --gas-adjustment=$(GAS_ADJUSTMENT) --broadcast-mode=block --yes --chain-id=$(CHAIN_ID) \
		  t1/$(BASE_PORT) $$addr -ojson | tee /dev/stderr | grep -q '"code":0'; }

t1/$(BASE_PORT)/cosmos-client-account.setup:
	test ! -f t1/$(BASE_PORT)/cosmos-client-account || \
	  $(AGCH) --home=t1/$(BASE_PORT)/owner --keyring-backend=test tx authz grant \
		--gas=auto --gas-adjustment=$(GAS_ADJUSTMENT) --broadcast-mode=block --yes --chain-id=$(CHAIN_ID) --from=owner \
		$$(cat t1/$(BASE_PORT)/ag-cosmos-helper-address) generic --msg-type=/agoric.swingset.MsgDeliverInbound
	date > $@

t1/$(BASE_PORT)/cosmos-fee-account.setup:
	test ! -f t1/$(BASE_PORT)/cosmos-fee-account || \
	  $(AGCH) --home=t1/$(BASE_PORT)/owner --keyring-backend=test tx feegrant grant \
		--gas=auto --gas-adjustment=$(GAS_ADJUSTMENT) --broadcast-mode=block --yes --chain-id=$(CHAIN_ID) --from=owner \
		--period=5 --period-limit=200uist $$(cat t1/$(BASE_PORT)/cosmos-fee-account) $$(cat t1/$(BASE_PORT)/ag-cosmos-helper-address)
	date > $@

# Actually start the ag-solo.
t1-start-ag-solo: t1/$(BASE_PORT)/cosmos-client-account.setup t1/$(BASE_PORT)/cosmos-fee-account.setup
	addr=$$(cat t1/$(BASE_PORT)/ag-cosmos-helper-address); \
	$(AGCH) query auth account $$addr >/dev/null 2>&1 || \
		$(AGCH) --home=t1/bootstrap tx bank send --keyring-backend=test --from=bootstrap \
		--gas=auto --gas-adjustment=$(GAS_ADJUSTMENT) --broadcast-mode=block --yes --chain-id=$(CHAIN_ID) \
		bootstrap $$addr 1uist
	cd t1/$(BASE_PORT) && \
		SOLO_OTEL_EXPORTER_PROMETHEUS_PORT=$(SOLO_OTEL_EXPORTER_PROMETHEUS_PORT) \
		$(AG_SOLO) start

scenario2-core-eval: $(EVAL_CLEAN)
	$(AGCH) --home=t1/bootstrap tx gov submit-proposal swingset-core-eval \
		$(EVAL_PERMIT) $(EVAL_CLEAN) \
		--title="Swingset core eval" --description="Evaluate $(EVAL_CODE)" --deposit=$(EVAL_DEPOSIT) \
		--gas=auto --gas-adjustment=$(GAS_ADJUSTMENT) \
		--yes --chain-id=$(CHAIN_ID) --keyring-backend=test --from=bootstrap -b block

scenario2-vote:
	$(AGCH) --home=t1/bootstrap tx gov vote $(VOTE_PROPOSAL) $(VOTE_OPTION) \
		--gas=auto --gas-adjustment=$(GAS_ADJUSTMENT) \
		--yes --chain-id=$(CHAIN_ID) --keyring-backend=test --from=bootstrap -b block

# scenario3 is a single JS process without any Golang.  However,
# the client and the chain within the process run two separate
# kernels.  There is an artificial delay when handling messages
# destined for the chain kernel, to prevent you from accidentally
# creating programs that won't work on the real blockchain.
#
# If you still want the client/chain separation without delay,
# then run: make scenario3-setup FAKE_CHAIN_DELAY=0
VATWORKER=local
scenario3-setup:
	rm -rf t3
	NODE_OPTIONS= $(AG_SOLO) init t3 --egresses=fake --webport=$(BASE_PORT) --defaultManagerType=$(VATWORKER)
	@echo 'Execute `make scenario3-run` to run the client and simulated chain'

# This runs both the client and the fake chain.
scenario3-run-client: scenario3-run
# Set the fake chain here in case the delay has changed.
scenario3-run:
	cd t3 && \
		NODE_OPTIONS= $(AG_SOLO) set-fake-chain --delay=$(FAKE_CHAIN_DELAY) mySimGCI
	cd t3 && \
		SOLO_OTEL_EXPORTER_PROMETHEUS_PORT=$(SOLO_OTEL_EXPORTER_PROMETHEUS_PORT) \
		OTEL_EXPORTER_PROMETHEUS_PORT=$(OTEL_EXPORTER_PROMETHEUS_PORT) \
		$(AG_SOLO) start

docker-pull:
	for f in '' -setup -solo; do \
		docker pull $(REPOSITORY)$$f:latest || exit $$?; \
	done

docker-install: docker-pull
	install -m 755 docker/* /usr/local/bin/

build-chain:
	$(AGC) build

build-helper:
	$(AGCH) build

install-agd:
	mkdir -p "$(BIN)"
	ln -sf "$(SDK_ROOT)/bin/agd" "$(BIN)/agd"

install-local:
	mkdir -p "$(BIN)"
	ln -sf "$(SDK_ROOT)/bin/agd" "$(BIN)/ag-chain-cosmos"
	ln -sf "$$PWD/bin/ag-nchainz" "$(BIN)/"

start-ag-solo:
	rm -rf t1
	$(AG_SOLO) init t1
	cd t1 && $(AG_SOLO) start

show-local-gci:
	@./calc-gci.js ~/.ag-chain-cosmos/config/genesis.json

set-local-gci-ingress:
	set -e; \
	gci=`./calc-gci.js t1/n0/config/genesis.json`; \
	rpcport=`./calc-rpcport.js t1/n0/config/config.toml`; \
	set -e; for port in `seq $(BASE_PORT) $$(($(BASE_PORT) + $(NUM_SOLOS) - 1))`; do \
		(cd t1/$$port && \
			NODE_OPTIONS= $(AG_SOLO) set-gci-ingress --chainID=$(CHAIN_ID) $$gci $$rpcport); \
	done
