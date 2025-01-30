# sed is more fragile, but we don't want to take a Node.js or jq dependency
# just to compile the Golang pieces under Docker.
NAME := $(shell sed -ne 's/.*"name": "\([^"]*\)".*/\1/p' package.json)
VERSION := $(shell sed -ne 's/.*"version": "\([^"]*\)".*/\1/p' package.json)
GIT_COMMIT = $(shell hash=`git rev-parse --short HEAD 2>/dev/null`; if test -n "$$hash"; then echo $$hash`git diff --quiet || echo -dirty`; else cat git-revision.txt; fi)
PR_TARGET_REPO = ../../.git
# TODO: figure out how to handle other branches like pismo-release
PR_TARGET_BRANCH = master

default: all

MOD_READONLY = -mod=readonly

BIN := $(shell echo $${GOBIN-$${GOPATH-$$HOME/go}/bin})

include Makefile.ledger

whitespace :=
whitespace := $(whitespace) $(whitespace)
comma := ,
build_tags_comma_sep := $(subst $(whitespace),$(comma),$(build_tags))

# Note that the version.Name must be alphanumeric only.
# Otherwise, generated "os" keyrings on Ubuntu 20.04 can't be read.
VersionName := $(shell echo "$(NAME)" | sed -e 's/[^A-Za-z0-9]//g')

# process linker flags
ldflags = -X github.com/cosmos/cosmos-sdk/version.Name=$(VersionName) \
		-X github.com/cosmos/cosmos-sdk/version.AppName=agd \
		-X github.com/cosmos/cosmos-sdk/version.Version=$(VERSION) \
		-X github.com/cosmos/cosmos-sdk/version.Commit=$(GIT_COMMIT) \
		-X "github.com/cosmos/cosmos-sdk/version.BuildTags=$(build_tags_comma_sep)"

gcflags =
shared_ldflags = $(ldflags)

ifneq ($(GO_DEBUG),)
ldflags += -compressdwarf=false
gcflags += -N -l
else ifeq ($(shell uname -s 2>/dev/null),Darwin)
# Darwin's latest ld crashes with https://github.com/Agoric/agoric-sdk/issues/8367
shared_ldflags += -w
endif

BUILD_FLAGS := -tags "$(build_tags)" -gcflags '$(gcflags)' -ldflags '$(ldflags)'
SHARED_BUILD_FLAGS := -tags "$(build_tags)" -gcflags '$(gcflags)' -ldflags '$(shared_ldflags)'

all: compile-chain

compile-chain: compile-agd compile-daemon
compile-go: compile-agd compile-libdaemon
compile-node: node-compile-gyp

compile-daemon: compile-libdaemon node-compile-gyp

# We need this so that node-gyp can be found.
node-compile-gyp:
	if yarn -v >/dev/null 2>&1; then \
		yarn build:gyp; \
	else \
		npm run build:gyp; \
	fi

compile-agd: go.sum
	go build -v $(MOD_READONLY) $(BUILD_FLAGS) -buildmode=exe -o build/agd ./cmd/agd

install-agd: go.sum
	go install -v $(MOD_READONLY) $(BUILD_FLAGS) -buildmode=exe ./cmd/agd

# Only run from the package.json build:gyp script.
compile-gyp:
	cp binding.gyp.in binding.gyp
	node-gyp configure build $(GYP_DEBUG) || { status=$$?; rm -f binding.gyp; exit $$status; }
	rm -f binding.gyp

compile-libdaemon: go.sum
	go build -v $(MOD_READONLY) $(SHARED_BUILD_FLAGS) -buildmode=c-shared \
		-o build/libagcosmosdaemon.so ./cmd/libdaemon/main.go

go.sum: go.mod
	@echo "--> Ensure dependencies have not been modified unless suppressed by SKIP_MOD_VERIFY ..."
ifndef SKIP_MOD_VERIFY
	GO111MODULE=on go mod verify
endif
	GO111MODULE=on go mod tidy
	@echo "--> Download go modules to local cache"
	go mod download

###############################################################################
###                           Protobuf                                    ###
###############################################################################

proto-gen: proto-tools
	PATH="${BIN}:$$PATH" ./scripts/protocgen.sh

proto-lint: proto-tools
	${BIN}/buf lint

proto-check-breaking: proto-tools
	${BIN}/buf breaking --against $(PR_TARGET_REPO)#branch=$(PR_TARGET_BRANCH),subdir=golang/cosmos

GOGO_PROTO_URL = file://$(shell go list -m -f '{{ .Dir }}' github.com/gogo/protobuf)
# GOOGLE_API_URL = file://$(shell go list -m -f '{{ .Dir }}' github.com/googleapis/googleapis)/google/api
IBC_PROTO_URL = file://$(shell go list -m -f '{{ .Dir }}' github.com/cosmos/ibc-go/v8)/proto/ibc/core
COSMOS_PROTO_PROTO_URL = file://$(shell go list -m -f '{{ .Dir }}' github.com/cosmos/cosmos-proto)/proto/cosmos_proto
COSMOS_SDK_PROTO_URL = file://$(shell go list -m -f '{{ .Dir }}' github.com/cosmos/cosmos-sdk)/proto/cosmos

COSMOS_PROTO_TYPES = third_party/proto/cosmos_proto
GOGO_PROTO_TYPES  = third_party/proto/gogoproto
GOOGLE_API_TYPES = third_party/proto/google/api
GOOGLE_PROTO_TYPES = third_party/proto/google/protobuf
IBC_CHANNEL_TYPES = third_party/proto/ibc/core/channel/v1
IBC_CLIENT_TYPES = third_party/proto/ibc/core/client/v1
SDK_BASE_TYPES = third_party/proto/cosmos/base/v1beta1
SDK_QUERY_TYPES = third_party/proto/cosmos/base/query/v1beta1
SDK_UPGRADE_TYPES = third_party/proto/cosmos/upgrade/v1beta1

proto-update-deps:
	mkdir -p $(COSMOS_PROTO_TYPES)
	url="$(COSMOS_PROTO_PROTO_URL)"; \
	curl -sSL $$url/cosmos.proto > $(COSMOS_PROTO_TYPES)/cosmos.proto

	mkdir -p $(GOGO_PROTO_TYPES)
	url="$(GOGO_PROTO_URL)"; \
	curl -sSL $$url/gogoproto/gogo.proto > $(GOGO_PROTO_TYPES)/gogo.proto

	# Downloading from a not-a-go-module is problematic. These files are artifacts for now.
	# mkdir -p $(GOOGLE_API_TYPES)
	# url="$(GOOGLE_API_URL)"; \
	# curl -sSL $$url/annotations.proto > $(GOOGLE_API_TYPES)/annotations.proto && \
	# curl -sSL $$url/http.proto > $(GOOGLE_API_TYPES)/http.proto && \
	# curl -sSL $$url/httpbody.proto > $(GOOGLE_API_TYPES)/httpbody.proto &&

	mkdir -p $(GOOGLE_PROTO_TYPES)
	url="$(GOGO_PROTO_URL)"; \
	curl -sSL $$url/protobuf/google/protobuf/any.proto > $(GOOGLE_PROTO_TYPES)/any.proto

	url="$(IBC_PROTO_URL)"; \
	mkdir -p $(IBC_CHANNEL_TYPES) && \
	curl -sSL $$url/channel/v1/channel.proto > $(IBC_CHANNEL_TYPES)/channel.proto && \
	mkdir -p $(IBC_CLIENT_TYPES) && \
	curl -sSL $$url/client/v1/client.proto > $(IBC_CLIENT_TYPES)/client.proto

	url="$(COSMOS_SDK_PROTO_URL)"; \
	mkdir -p $(SDK_BASE_TYPES) && \
	curl -sSL $$url/base/v1beta1/coin.proto > $(SDK_BASE_TYPES)/coin.proto && \
	mkdir -p $(SDK_QUERY_TYPES) && \
	curl -sSL $$url/base/query/v1beta1/pagination.proto > $(SDK_QUERY_TYPES)/pagination.proto && \
	mkdir -p $(SDK_UPGRADE_TYPES) && \
	curl -sSL $$url/upgrade/v1beta1/upgrade.proto > $(SDK_UPGRADE_TYPES)/upgrade.proto

UNAME_S ?= $(shell uname -s)
UNAME_M ?= $(shell uname -m)

BUF_VERSION ?= 1.0.0

PROTOC_VERSION ?= 3.11.2
ifeq ($(UNAME_S),Linux)
  ifeq ($(UNAME_M),aarch64)
    PROTOC_ZIP ?= protoc-${PROTOC_VERSION}-linux-aarch_64.zip
  else
    PROTOC_ZIP ?= protoc-${PROTOC_VERSION}-linux-x86_64.zip
  endif
endif
ifeq ($(UNAME_S),Darwin)
  PROTOC_ZIP ?= protoc-${PROTOC_VERSION}-osx-x86_64.zip
endif

proto-tools: proto-tools-stamp buf grpc-gateway-stamp

proto-tools-stamp:
	echo "Installing protoc compiler..."
	mkdir -p "${BIN}"
	(cd /tmp; \
	curl -OL "https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/${PROTOC_ZIP}"; \
	unzip -o ${PROTOC_ZIP} -d "${BIN}/.." bin/protoc 'include/*'; \
	rm -f ${PROTOC_ZIP})

	echo "Installing protoc-gen-gocosmos..."
	go install github.com/regen-network/cosmos-proto/protoc-gen-gocosmos

	# Create dummy file to satisfy dependency and avoid
	# rebuilding when this Makefile target is hit twice
	# in a row
	touch $@

buf: buf-stamp

buf-stamp:
	echo "Installing buf..."
	curl -sSL \
    "https://github.com/bufbuild/buf/releases/download/v${BUF_VERSION}/buf-${UNAME_S}-${UNAME_M}" \
    -o "${BIN}/buf" && \
	chmod +x "${BIN}/buf"

	touch $@

GATEWAY_PKGS = \
	github.com/grpc-ecosystem/grpc-gateway/protoc-gen-grpc-gateway \
	github.com/grpc-ecosystem/grpc-gateway/protoc-gen-swagger \
	google.golang.org/protobuf/cmd/protoc-gen-go

grpc-gateway-stamp:
	go install $(GATEWAY_PKGS)
	touch $@

tools-clean:
	rm -f proto-tools-stamp buf-stamp grpc-gateway-stamp


lint:
	golangci-lint run

test:
	go test -coverprofile=coverage.txt -covermode=atomic ./...
