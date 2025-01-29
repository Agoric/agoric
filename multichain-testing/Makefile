# see https://github.com/cosmology-tech/starship/blob/0e18757b8393357fc66426c5ee23da4ccf760e74/examples/getting-started/Makefile

NAME = agoric-multichain-testing
FILE = config.yaml

HELM_REPO = starship
HELM_CHART = devnet
HELM_VERSION = v0.2.20

###############################################################################
###                              All commands                               ###
###############################################################################

.PHONY: setup
setup: setup-deps setup-kind

.PHONY: stop
stop: stop-forward delete

.PHONY: clean
clean: stop clean-kind

# To support a debug cycle like:
#  make stop rebuild start && yarn test:main test/ibc-transfers.ts
.PHONY: rebuild
rebuild:
	$(MAKE) -C ../packages/deployment docker-build-sdk TAG=dev
	kind load docker-image ghcr.io/agoric/agoric-sdk:dev --name $(KIND_CLUSTER)

###############################################################################
###                          Dependency check                               ###
###############################################################################

.PHONY: check
setup-deps:
	$(CURDIR)/scripts/dev-setup.sh

###############################################################################
###                              Helm Charts                                ###
###############################################################################

install:
	$(CURDIR)/scripts/install.sh --config $(FILE) --name $(NAME) --version $(HELM_VERSION)

delete:
	-helm delete $(NAME)

###############################################################################
###                                 Port forward                            ###
###############################################################################

.PHONY: port-forward
port-forward:
	$(CURDIR)/scripts/port-forward.sh --config=$(FILE)

.PHONY: stop-forward
stop-forward:
	-pkill -f "port-forward"

###############################################################################
###                          Local Kind Setup                               ###
###############################################################################
KIND_CLUSTER=agship

.PHONY: setup-kind
setup-kind:
	kind create cluster --name $(KIND_CLUSTER)

.PHONY: clean-kind
clean-kind:
	-kind delete cluster --name $(KIND_CLUSTER)

###############################################################################
###                          Agoric Setup                                   ###
###############################################################################
PROVISION_POOL_ADDR=agoric1megzytg65cyrgzs6fvzxgrcqvwwl7ugpt62346

# add address
add-address:
	kubectl exec -i agoriclocal-genesis-0 -c validator -- agd keys add user1

fund-provision-pool:
	kubectl exec -i agoriclocal-genesis-0 -c validator -- agd tx bank send faucet $(PROVISION_POOL_ADDR) 1000000000uist -y -b block

override-chain-registry:
	scripts/fetch-starship-chain-info.ts && \
	scripts/deploy-cli.ts src/revise-chain-info.builder.js

register-bank-assets:
	scripts/fetch-starship-chain-info.ts && \
	scripts/deploy-cli.ts src/register-interchain-bank-assets.builder.js \
		assets="$$(scripts/make-bank-asset-info.ts)"

ADDR=agoric1ldmtatp24qlllgxmrsjzcpe20fvlkp448zcuce
COIN=1000000000uist

fund-wallet:
	kubectl exec -i agoriclocal-genesis-0 -c validator -- agd tx bank send faucet $(ADDR) $(COIN) -y -b block

provision-smart-wallet:
	kubectl exec -i agoriclocal-genesis-0 -c validator -- agd tx swingset provision-one wallet $(ADDR) SMART_WALLET --from $(ADDR) -y -b block

# view agoric swingset logs from slog file, until we can set `DEBUG=SwingSet:vat,SwingSet:ls`
tail-slog:
	kubectl exec -i agoriclocal-genesis-0 -c validator -- tail -f slog.slog

###############################################################################
###                           Start All                                     ###
###############################################################################

.PHONY: wait-for-pods
wait-for-pods:
	scripts/pod-readiness.ts

.PHONY: start
start: install wait-for-pods port-forward fund-provision-pool override-chain-registry register-bank-assets

