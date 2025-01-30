package vm

import (
	"encoding/json"

	"github.com/cosmos/gogoproto/jsonpb"
	"github.com/cosmos/gogoproto/proto"
)

// We need jsonpb for its access to the global registry.
var marshaller = jsonpb.Marshaler{EmitDefaults: true}

func ProtoJSONMarshal(val interface{}) ([]byte, error) {
	if pm, ok := val.(proto.Message); ok {
		var s string
		s, err := marshaller.MarshalToString(pm)
		return []byte(s), err
	}

	// Marshal a non-proto value to JSON.
	return json.Marshal(val)
}

// ProtoJSONMarshalSlice marshals a slice of proto messages and non-proto values to
// a single JSON byte slice.
func ProtoJSONMarshalSlice(vals []interface{}) ([]byte, error) {
	var err error
	jsonSlice := make([]json.RawMessage, len(vals))
	for i, val := range vals {
		jsonSlice[i], err = ProtoJSONMarshal(val)
		if err != nil {
			return nil, err
		}
	}

	// Marshal the JSON array to a single JSON byte slice.
	return json.Marshal(jsonSlice)
}
