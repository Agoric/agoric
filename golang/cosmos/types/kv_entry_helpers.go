package types

import (
	"encoding/json"
	"fmt"
	"io"

	storetypes "cosmossdk.io/store/types"
	swingsettypes "github.com/Agoric/agoric-sdk/golang/cosmos/x/swingset/types"
	vstoragetypes "github.com/Agoric/agoric-sdk/golang/cosmos/x/vstorage/types"
)

// These helpers facilitate handling KVEntry streams, in particular for the
// swing-store "export data" use case. The goal is to avoid passing around
// large slices of key/value pairs.
//
// Handling of these streams is primarily accomplished through a KVEntryReader
// interface, with multiple implementations for different backing sources, as
// well as a helper function to consume a reader and write the entries into a
// byte Writer as line terminated json encoded KVEntry.

// We attempt to pass sdk.Iterator around as much as possible to abstract a
// stream of Key/Value pairs without requiring the whole slice to be held in
// memory if possible. Cosmos SDK defines iterators as yielding Key/Value
// pairs, both as byte slices.
//
// More precisely, we define here the following:
// - A KVEntryReader interface allowing to Read the KVEntry one by one from an
//   underlying source.
// - Multiple implementations of the KVEntryReader interface:
//   - NewKVIteratorReader constructs a reader which consumes an sdk.Iterator.
//     Keys and values are converted from byte slices to strings, and nil values
//     are preserved as KVEntry instances with no value.
//   - A generic reader which uses a slice of key/value data, and a conversion
//     function from that data type to a KVEntry. The reader does bounds
//     checking and keeps track of the current position. The following data
//     types are available:
//     - NewVstorageDataEntriesReader constructs a reader from a slice of
//       vstorage DataEntry values.
//     - NewSwingStoreExportDataEntriesReader constructs a reader from a slice
//       of SwingStoreExportDataEntry values.
//     - NewJsonRawMessageKVEntriesReader constructs a reader from a slice of
//       [key: string, value?: string | null] JSON array values.
//   - NewJsonlKVEntryDecoderReader constructs a reader from an io.ReadCloser
//     (like a file) containing JSON Lines in which each item is a
//     [key: string, value?: string | null] array.
// - EncodeKVEntryReaderToJsonl consumes a KVEntryReader and writes its entries
//   into an io.Writer as a sequence of single-line JSON texts. The encoding of
//   each line is [key, value] if the KVEntry has a value, and [key] otherwise.
//   This format terminates each line, but is still compatible with JSON Lines
//   (which is line feed *separated*) for Go and JS decoders.

// KVEntryReader is an abstraction for iteratively reading KVEntry data.
type KVEntryReader interface {
	// Read returns the next KVEntry, or an error.
	// An `io.EOF` error indicates that the previous Read() returned the final KVEntry.
	Read() (KVEntry, error)
	// Close frees the underlying resource (such as a slice or file descriptor).
	Close() error
}

var _ KVEntryReader = &kvIteratorReader{}

// kvIteratorReader is a KVEntryReader backed by an sdk.Iterator
type kvIteratorReader struct {
	iter storetypes.Iterator
}

// NewKVIteratorReader returns a KVEntryReader backed by an sdk.Iterator.
func NewKVIteratorReader(iter storetypes.Iterator) KVEntryReader {
	return &kvIteratorReader{
		iter: iter,
	}
}

// Read yields the next KVEntry from the source iterator
// Implements KVEntryReader
func (ir kvIteratorReader) Read() (next KVEntry, err error) {
	if !ir.iter.Valid() {
		// There is unfortunately no way to differentiate completion from iteration
		// errors with the implementation of Iterators by cosmos-sdk since the
		// iter.Error() returns an error in both cases
		return KVEntry{}, io.EOF
	}

	key := ir.iter.Key()
	if len(key) == 0 {
		return KVEntry{}, fmt.Errorf("nil or empty key yielded by iterator")
	}

	value := ir.iter.Value()
	ir.iter.Next()
	if value == nil {
		return NewKVEntryWithNoValue(string(key)), nil
	} else {
		return NewKVEntry(string(key), string(value)), nil
	}
}

func (ir kvIteratorReader) Close() error {
	return ir.iter.Close()
}

var _ KVEntryReader = &kvEntriesReader[any]{}

// kvEntriesReader is the KVEntryReader using an underlying slice of generic
// kv entries. It reads from the slice sequentially using a type specific
// toKVEntry func, performing bounds checks, and tracking the position.
type kvEntriesReader[T any] struct {
	entries   []T
	toKVEntry func(T) (KVEntry, error)
	nextIndex int
}

// Read yields the next KVEntry from the source
// Implements KVEntryReader
func (reader *kvEntriesReader[T]) Read() (next KVEntry, err error) {
	if reader.entries == nil {
		return KVEntry{}, fmt.Errorf("reader closed")
	}

	length := len(reader.entries)

	if reader.nextIndex < length {
		entry, err := reader.toKVEntry(reader.entries[reader.nextIndex])
		reader.nextIndex += 1
		if err != nil {
			return KVEntry{}, err
		}
		if !entry.IsValidKey() {
			return KVEntry{}, fmt.Errorf("source yielded a KVEntry with an invalid key")
		}
		return entry, err
	} else if reader.nextIndex == length {
		reader.nextIndex += 1
		return KVEntry{}, io.EOF
	} else {
		return KVEntry{}, fmt.Errorf("index %d is out of source bounds (length %d)", reader.nextIndex, length)
	}
}

// Close releases the source slice
// Implements KVEntryReader
func (reader *kvEntriesReader[any]) Close() error {
	reader.entries = nil
	return nil
}

// NewVstorageDataEntriesReader creates a KVEntryReader backed by a
// vstorage DataEntry slice
func NewVstorageDataEntriesReader(vstorageDataEntries []*vstoragetypes.DataEntry) KVEntryReader {
	return &kvEntriesReader[*vstoragetypes.DataEntry]{
		entries: vstorageDataEntries,
		toKVEntry: func(sourceEntry *vstoragetypes.DataEntry) (KVEntry, error) {
			return NewKVEntry(sourceEntry.Path, sourceEntry.Value), nil
		},
	}
}

// NewSwingStoreExportDataEntriesReader creates a KVEntryReader backed by
// a SwingStoreExportDataEntry slice
func NewSwingStoreExportDataEntriesReader(exportDataEntries []*swingsettypes.SwingStoreExportDataEntry) KVEntryReader {
	return &kvEntriesReader[*swingsettypes.SwingStoreExportDataEntry]{
		entries: exportDataEntries,
		toKVEntry: func(sourceEntry *swingsettypes.SwingStoreExportDataEntry) (KVEntry, error) {
			return NewKVEntry(sourceEntry.Key, sourceEntry.Value), nil
		},
	}
}

// NewJsonRawMessageKVEntriesReader creates a KVEntryReader backed by
// a json.RawMessage slice
func NewJsonRawMessageKVEntriesReader(jsonEntries []json.RawMessage) KVEntryReader {
	return &kvEntriesReader[json.RawMessage]{
		entries: jsonEntries,
		toKVEntry: func(sourceEntry json.RawMessage) (entry KVEntry, err error) {
			err = json.Unmarshal(sourceEntry, &entry)
			return entry, err
		},
	}
}

var _ KVEntryReader = &jsonlKVEntryDecoderReader{}

// jsonlKVEntryDecoderReader is the KVEntryReader decoding
// jsonl-like encoded key/value pairs.
type jsonlKVEntryDecoderReader struct {
	closer  io.Closer
	decoder *json.Decoder
}

// Read yields the next decoded KVEntry
// Implements KVEntryReader
func (reader jsonlKVEntryDecoderReader) Read() (next KVEntry, err error) {
	err = reader.decoder.Decode(&next)
	return next, err
}

// Close release the underlying resource backing the decoder
// Implements KVEntryReader
func (reader jsonlKVEntryDecoderReader) Close() error {
	return reader.closer.Close()
}

// NewJsonlKVEntryDecoderReader creates a KVEntryReader over a byte
// stream reader that decodes each line as a json encoded KVEntry. The entries
// are yielded in order they're present in the stream.
func NewJsonlKVEntryDecoderReader(byteReader io.ReadCloser) KVEntryReader {
	return &jsonlKVEntryDecoderReader{
		closer:  byteReader,
		decoder: json.NewDecoder(byteReader),
	}
}

// EncodeKVEntryReaderToJsonl consumes a KVEntryReader and JSON encodes each
// KVEntry, terminating by new lines.
// It will not Close the Reader when done
func EncodeKVEntryReaderToJsonl(reader KVEntryReader, bytesWriter io.Writer) (err error) {
	encoder := json.NewEncoder(bytesWriter)
	encoder.SetEscapeHTML(false)
	for {
		entry, err := reader.Read()
		if err == io.EOF {
			return nil
		} else if err != nil {
			return err
		}

		err = encoder.Encode(entry)
		if err != nil {
			return err
		}
	}
}

var _ KVEntryReader = &kvHookingReader{}

// kvHookingReader is a KVEntryReader backed by another KVEntryReader which
// provides callbacks for read and close
type kvHookingReader struct {
	reader  KVEntryReader
	onRead  func(entry KVEntry) error
	onClose func() error
}

// NewKVHookingReader returns a KVEntryReader backed by another KVEntryReader
func NewKVHookingReader(reader KVEntryReader, onRead func(entry KVEntry) error, onClose func() error) KVEntryReader {
	return &kvHookingReader{
		reader,
		onRead,
		onClose,
	}
}

// Read yields the next KVEntry from the source reader
// Implements KVEntryReader
func (hr kvHookingReader) Read() (next KVEntry, err error) {
	next, err = hr.reader.Read()

	if err == nil {
		err = hr.onRead(next)
	}

	return next, err
}

// Close releases the underlying source reader
// Implements KVEntryReader
func (hr kvHookingReader) Close() error {
	err := hr.reader.Close()
	if err == nil {
		err = hr.onClose()
	}

	return err
}
