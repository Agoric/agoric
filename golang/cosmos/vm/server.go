package vm

import (
	"context"
	"fmt"
	"sync"

	storetypes "cosmossdk.io/store/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// AgdServer manages communication from the VM to the ABCI app.  The structure
// is mutable and the mutex must be held to read or write any field.
type AgdServer struct {
	currentCtx context.Context
	mtx        sync.Mutex
	// zero is an out-of-bounds port number
	lastPort int
	// portToHandler[i] is nonzero iff portToName[i] is nonempty
	portToHandler map[int]PortHandler
	// portToName[nameToPort[s]] == s && nameToPort[portToName[i]] == i for all i, s
	portToName map[int]string
	nameToPort map[string]int
}

var wrappedEmptySDKContext = sdk.WrapSDKContext(
	sdk.Context{}.WithContext(context.Background()),
)

// NewAgdServer returns a pointer to a new AgdServer with empty context and port
// mappings.
func NewAgdServer() *AgdServer {
	return &AgdServer{
		currentCtx:    wrappedEmptySDKContext,
		mtx:           sync.Mutex{},
		portToHandler: make(map[int]PortHandler),
		portToName:    make(map[int]string),
		nameToPort:    make(map[string]int),
	}
}

// SetControllerContext sets the context to the given argument and returns a function
// which will reset the context to an empty context (not the old context).
func (s *AgdServer) SetControllerContext(ctx sdk.Context) func() {
	// We are only called by the controller, so we assume that it is billing its
	// own meter usage.
	s.mtx.Lock()
	defer s.mtx.Unlock()
	s.currentCtx = sdk.WrapSDKContext(ctx.WithGasMeter(storetypes.NewInfiniteGasMeter()))
	return func() {
		s.mtx.Lock()
		defer s.mtx.Unlock()
		s.currentCtx = wrappedEmptySDKContext
	}
}

// getContextAndHandler returns the current context and the handler for the
// given port number.
func (s *AgdServer) getContextAndHandler(port int) (context.Context, PortHandler) {
	s.mtx.Lock()
	defer s.mtx.Unlock()
	ctx := s.currentCtx
	handler := s.portToHandler[port]
	return ctx, handler
}

// ReceiveMessage is the method the VM calls in order to have agd receive a
// Message.
func (s *AgdServer) ReceiveMessage(msg *Message, reply *string) error {
	ctx, handler := s.getContextAndHandler(msg.Port)
	if handler == nil {
		return fmt.Errorf("unregistered port %d", msg.Port)
	}
	resp, err := handler.Receive(ctx, msg.Data)
	*reply = resp
	return err
}

// GetPort returns the port number for the given port name, or 0 if the name is
// not registered.
func (s *AgdServer) GetPort(name string) int {
	s.mtx.Lock()
	defer s.mtx.Unlock()
	return s.nameToPort[name]
}

// MustRegisterPortHandler attempts to RegisterPortHandler, panicing on error.
func (s *AgdServer) MustRegisterPortHandler(name string, portHandler PortHandler) int {
	port, err := s.RegisterPortHandler(name, portHandler)
	if err != nil {
		panic(err)
	}
	return port
}

// RegisterPortHandler registers the handler to a new port number, then maps the name to it,
// returning the port number. If the name was previously in use, an error is returned.
func (s *AgdServer) RegisterPortHandler(name string, portHandler PortHandler) (int, error) {
	s.mtx.Lock()
	defer s.mtx.Unlock()
	if _, ok := s.nameToPort[name]; ok {
		return 0, fmt.Errorf("name %s already in use", name)
	}
	s.lastPort++
	s.portToHandler[s.lastPort] = NewProtectedPortHandler(portHandler)
	s.portToName[s.lastPort] = name
	s.nameToPort[name] = s.lastPort
	return s.lastPort, nil
}

// UnregisterPortHandler unregisters the handler and name mappings for this port
// number, and the reverse mapping for its name, if any of these exist.  If
// portNum is not registered, return an error.
func (s *AgdServer) UnregisterPortHandler(portNum int) error {
	s.mtx.Lock()
	defer s.mtx.Unlock()
	if s.portToHandler[portNum] == nil {
		return fmt.Errorf("port %d not registered", portNum)
	}
	delete(s.portToHandler, portNum)
	name := s.portToName[portNum]
	delete(s.portToName, portNum)
	delete(s.nameToPort, name)
	return nil
}
