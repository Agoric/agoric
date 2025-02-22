# ADR 0001: Implement Commiting Client App-side

## Changelog

* {date}: {changelog}

## Status

DRAFT

## Abstract

> "If you can't explain it simply, you don't understand it well enough." Provide
> a simplified and layman-accessible explanation of the ADR.
> A short (~200 word) description of the issue being addressed.

Note:
This ADR seeks to change and implement commitingClient functionality on the app side and use the cosmos SDK 50 RegisterTendermintService method on the App to inject the wrapper.

## Context

Due to the mechanism of how Swingset works, it blocks on the end block. The default cometBFT local client does not respond to queries because its mutexer is locked. The current solution for this was forking cometBFT and implementing a new client called [commitingClient](https://github.com/agoric-labs/cometbft/commit/e8404cda81adebf6f5e7a87abc84e626cd2051a5
), changing the functionality to obtain a write lock only when invoking application methods that modify the state, specifically SetOption, InitChain, Commit, and ApplySnapshotChunk. The solution works; however, the Comet team did not accept the change to be upstreamed and gave us the burden of maintaining a fork. 

The way commitingClient works is that it implements the following interface: 

```go
// Application is an interface that enables any finite, deterministic state machine
// to be driven by a blockchain-based replication engine via the ABCI.
type Application interface {
    // Info/Query Connection
    Info(ctx context.Context, req *InfoRequest) (*InfoResponse, error)    // Return application info
    Query(ctx context.Context, req *QueryRequest) (*QueryResponse, error) // Query for state

    // Mempool Connection
    CheckTx(ctx context.Context, req *CheckTxRequest) (*CheckTxResponse, error) // Validate a tx for the mempool

    // Consensus Connection
    InitChain(ctx context.Context, req *InitChainRequest) (*InitChainResponse, error) // Initialize blockchain w validators/other info from CometBFT
    PrepareProposal(ctx context.Context, req *PrepareProposalRequest) (*PrepareProposalResponse, error)
    ProcessProposal(ctx context.Context, req *ProcessProposalRequest) (*ProcessProposalResponse, error)
    // FinalizeBlock delivers the decided block with its txs to the Application
    FinalizeBlock(ctx context.Context, req *FinalizeBlockRequest) (*FinalizeBlockResponse, error)
    // ExtendVote extends the vote with application specific data
    ExtendVote(ctx context.Context, req *ExtendVoteRequest) (*ExtendVoteResponse, error)
    // VerifyVoteExtension verifies the application's vote extension data for correctness.
    VerifyVoteExtension(ctx context.Context, req *VerifyVoteExtensionRequest) (*VerifyVoteExtensionResponse, error)
    // Commit the state and return the application Merkle root hash
    Commit(ctx context.Context, req *CommitRequest) (*CommitResponse, error)

    // State Sync Connection
    ListSnapshots(ctx context.Context, req *ListSnapshotsRequest) (*ListSnapshotsResponse, error)                // List available snapshots
    OfferSnapshot(ctx context.Context, req *OfferSnapshotRequest) (*OfferSnapshotResponse, error)                // Offer a snapshot to the application
    LoadSnapshotChunk(ctx context.Context, req *LoadSnapshotChunkRequest) (*LoadSnapshotChunkResponse, error)    // Load a snapshot chunk
    ApplySnapshotChunk(ctx context.Context, req *ApplySnapshotChunkRequest) (*ApplySnapshotChunkResponse, error) // Apply a snapshot chunk
}
```

Then, committingClient adds a RWInitMutex to manage concurrent access to the ABCI application. To allow concurrent reads, it acquires read-init locks for state-reading operations (CheckTx, DeliverTx, Query). It obtains exclusive write locks for state-mutating operations (SetOption, InitChain, Commit, ApplySnapshotChunk) to ensure atomic execution. [view implementation](https://github.com/agoric-labs/cometbft/blob/e8404cda81adebf6f5e7a87abc84e626cd2051a5/abci/client/committing_client.go#L15-L340)

## Alternatives

> This section describes alternative designs to the chosen design. This section
> is important and if an adr does not have any alternatives then it should be
> considered that the ADR was not thought through. 

## Decision

We propose to remove the `committingClient` and instead integrate its synchronization functionality in our own implementation of `cometABCIWrapper`, that we will call `syncCometABCIWrapper`. 
The new `syncCometABCIWrapper` will look something like this:

```go
package server

import (
	"context"

	abci "github.com/cometbft/cometbft/abci/types"
	abciproto "github.com/cometbft/cometbft/api/cometbft/abci/v1"

	servertypes "github.com/cosmos/cosmos-sdk/server/types"
)

#TODO: add mutexer logic 
type syncCometABCIWrapper struct {
	app servertypes.ABCI
}

func NewSyncCometABCIWrapper(app servertypes.ABCI) abci.Application {
	return cometABCIWrapper{app: app}
}

func (w cometABCIWrapper) Info(_ context.Context, req *abciproto.InfoRequest) (*abciproto.InfoResponse, error) {
	return w.app.Info(req)
}

func (w cometABCIWrapper) Query(ctx context.Context, req *abciproto.QueryRequest) (*abciproto.QueryResponse, error) {
	return w.app.Query(ctx, req)
}

func (w cometABCIWrapper) CheckTx(_ context.Context, req *abciproto.CheckTxRequest) (*abciproto.CheckTxResponse, error) {
	return w.app.CheckTx(req)
}

func (w cometABCIWrapper) InitChain(_ context.Context, req *abciproto.InitChainRequest) (*abciproto.InitChainResponse, error) {
	return w.app.InitChain(req)
}

func (w cometABCIWrapper) PrepareProposal(_ context.Context, req *abciproto.PrepareProposalRequest) (*abciproto.PrepareProposalResponse, error) {
	return w.app.PrepareProposal(req)
}

func (w cometABCIWrapper) ProcessProposal(_ context.Context, req *abciproto.ProcessProposalRequest) (*abciproto.ProcessProposalResponse, error) {
	return w.app.ProcessProposal(req)
}

func (w cometABCIWrapper) FinalizeBlock(_ context.Context, req *abciproto.FinalizeBlockRequest) (*abciproto.FinalizeBlockResponse, error) {
	return w.app.FinalizeBlock(req)
}

func (w cometABCIWrapper) ExtendVote(ctx context.Context, req *abciproto.ExtendVoteRequest) (*abciproto.ExtendVoteResponse, error) {
	return w.app.ExtendVote(ctx, req)
}

func (w cometABCIWrapper) VerifyVoteExtension(_ context.Context, req *abciproto.VerifyVoteExtensionRequest) (*abciproto.VerifyVoteExtensionResponse, error) {
	return w.app.VerifyVoteExtension(req)
}

func (w cometABCIWrapper) Commit(_ context.Context, _ *abciproto.CommitRequest) (*abciproto.CommitResponse, error) {
	return w.app.Commit()
}

func (w cometABCIWrapper) ListSnapshots(_ context.Context, req *abciproto.ListSnapshotsRequest) (*abciproto.ListSnapshotsResponse, error) {
	return w.app.ListSnapshots(req)
}

func (w cometABCIWrapper) OfferSnapshot(_ context.Context, req *abciproto.OfferSnapshotRequest) (*abciproto.OfferSnapshotResponse, error) {
	return w.app.OfferSnapshot(req)
}

func (w cometABCIWrapper) LoadSnapshotChunk(_ context.Context, req *abciproto.LoadSnapshotChunkRequest) (*abciproto.LoadSnapshotChunkResponse, error) {
	return w.app.LoadSnapshotChunk(req)
}

func (w cometABCIWrapper) ApplySnapshotChunk(_ context.Context, req *abciproto.ApplySnapshotChunkRequest) (*abciproto.ApplySnapshotChunkResponse, error) {
	return w.app.ApplySnapshotChunk(req)
}
```

And then following the comsmos SDK simapp example will inject it in 

```go
// agoric-sdk/golang/cosmos/app/app.go
// RegisterTendermintService implements the Application.RegisterTendermintService method.
func (app *SimApp) RegisterTendermintService(clientCtx client.Context) {
	cmtApp := server.NewSyncCometABCIWrapper(app)
	cmtservice.RegisterTendermintService(
		clientCtx,
		app.BaseApp.GRPCQueryRouter(),
		app.interfaceRegistry,
		cmtApp.Query,
	)
}
```

#TODO add configuration for using unsyc local client


## Consequences

> This section describes the resulting context, after applying the decision. All
> consequences should be listed here, not just the "positive" ones. A particular
> decision may have positive, negative, and neutral consequences, but all of them
> affect the team and project in the future.


### Positive

> {positive consequences}

### Negative

> {negative consequences}

### Neutral

> {neutral consequences}

## Further Discussions

> While an ADR is in the DRAFT or PROPOSED stage, this section should contain a
> summary of issues to be solved in future iterations (usually referencing comments
> from a pull-request discussion).
> 
> Later, this section can optionally list ideas or improvements the author or
> reviewers found during the analysis of this ADR.

## Test Cases [optional]

Test cases for an implementation are mandatory for ADRs that are affecting consensus
changes. Other ADRs can choose to include links to test cases if applicable.

## References

* {reference link}
