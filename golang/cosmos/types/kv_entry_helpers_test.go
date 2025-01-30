package types

import (
	"bytes"
	"errors"
	"io"
	"strings"
	"testing"

	storetypes "cosmossdk.io/store/types"
)

func toKVEntryIdentity(entry KVEntry) (KVEntry, error) {
	return entry, nil
}

func toKVEntryError(err error) (KVEntry, error) {
	return KVEntry{}, err
}

func checkSameKVEntry(t *testing.T, got KVEntry, expected KVEntry) {
	if got.key != expected.key {
		t.Errorf("got key %s, expected key %s", got.key, expected.key)
	}
	if got.value == nil && expected.value != nil {
		t.Errorf("got nil value, expected string %s", *expected.value)
	} else if got.value != nil && expected.value == nil {
		t.Errorf("got string value %s, expected nil", *got.value)
	} else if got.value != nil && expected.value != nil {
		if *got.value != *expected.value {
			t.Errorf("got string value %s, expected %s", *got.value, *expected.value)
		}
	}
}

func TestKVEntriesReaderNormal(t *testing.T) {
	source := []KVEntry{NewKVEntry("foo", "bar"), NewKVEntryWithNoValue("baz")}
	reader := kvEntriesReader[KVEntry]{entries: source, toKVEntry: toKVEntryIdentity}

	got1, err := reader.Read()
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	checkSameKVEntry(t, got1, source[0])

	got2, err := reader.Read()
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	checkSameKVEntry(t, got2, source[1])

	_, err = reader.Read()
	if err != io.EOF {
		t.Errorf("expected error io.EOF, got %v", err)
	}

	_, err = reader.Read()
	if err == nil || !strings.Contains(err.Error(), "bounds") {
		t.Errorf("expected out of bounds error, got %v", err)
	}

	err = reader.Close()
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}

	_, err = reader.Read()
	if err == nil || !strings.Contains(err.Error(), "reader closed") {
		t.Errorf("expected reader closed error, got %v", err)
	}
}

func TestKVEntriesReaderErrors(t *testing.T) {
	source := []error{errors.New("foo"), errors.New("bar")}
	reader := kvEntriesReader[error]{entries: source, toKVEntry: toKVEntryError}

	_, err := reader.Read()
	if err != source[0] {
		t.Errorf("got error %v, expected error %v", err, source[0])
	}

	// Nothing in the reader prevents reading after previous errors
	_, err = reader.Read()
	if err != source[1] {
		t.Errorf("got error %v, expected error %v", err, source[1])
	}

	_, err = reader.Read()
	if err != io.EOF {
		t.Errorf("expected error io.EOF, got %v", err)
	}
}

type kvEntryReaderIterator struct {
	reader  KVEntryReader
	current KVEntry
	err     error
}

// newKVEntryReaderIterator creates an iterator over a KVEntryReader.
// KVEntry keys and values are reported as []byte from the reader in order.
func newKVEntryReaderIterator(reader KVEntryReader) storetypes.Iterator {
	iter := &kvEntryReaderIterator{
		reader: reader,
	}
	iter.Next()
	return iter
}

// Domain implements sdk.Iterator
func (iter *kvEntryReaderIterator) Domain() (start []byte, end []byte) {
	return nil, nil
}

// Valid returns whether the current iterator is valid. Once invalid, the
// Iterator remains invalid forever.
func (iter *kvEntryReaderIterator) Valid() bool {
	if iter.err == io.EOF {
		return false
	} else if iter.err != nil {
		panic(iter.err)
	}
	return true
}

// checkValid implements the validity invariants of sdk.Iterator methods.
func (iter *kvEntryReaderIterator) checkValid() {
	if !iter.Valid() {
		panic("invalid iterator")
	}
}

// Next moves the iterator to the next entry from the reader.
// If Valid() returns false, this method will panic.
func (iter *kvEntryReaderIterator) Next() {
	iter.checkValid()

	iter.current, iter.err = iter.reader.Read()
}

// Key returns the key at the current position. Panics if the iterator is invalid.
// CONTRACT: key readonly []byte
func (iter *kvEntryReaderIterator) Key() (key []byte) {
	iter.checkValid()

	return []byte(iter.current.Key())
}

// Value returns the value at the current position. Panics if the iterator is invalid.
// CONTRACT: value readonly []byte
func (iter *kvEntryReaderIterator) Value() (value []byte) {
	iter.checkValid()

	if !iter.current.HasValue() {
		return nil
	} else {
		return []byte(iter.current.StringValue())
	}
}

// Error returns the last error encountered by the iterator, if any.
func (iter *kvEntryReaderIterator) Error() error {
	err := iter.err
	if err == io.EOF {
		return nil
	}

	return err
}

// Close closes the iterator, releasing any allocated resources.
func (iter *kvEntryReaderIterator) Close() error {
	return iter.reader.Close()
}

func TestKVIteratorReader(t *testing.T) {
	source := []KVEntry{NewKVEntry("foo", "bar"), NewKVEntryWithNoValue("baz")}
	iterator := newKVEntryReaderIterator(&kvEntriesReader[KVEntry]{entries: source, toKVEntry: toKVEntryIdentity})
	reader := NewKVIteratorReader(iterator)

	got1, err := reader.Read()
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	checkSameKVEntry(t, got1, source[0])

	got2, err := reader.Read()
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	checkSameKVEntry(t, got2, source[1])

	_, err = reader.Read()
	if err != io.EOF {
		t.Errorf("expected error io.EOF, got %v", err)
	}

	err = reader.Close()
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestJsonlEncodeAndReadBack(t *testing.T) {
	source := []KVEntry{NewKVEntry("foo", "bar"), NewKVEntryWithNoValue("baz")}
	sourceReader := &kvEntriesReader[KVEntry]{entries: source, toKVEntry: toKVEntryIdentity}

	var encodedKVEntries bytes.Buffer
	err := EncodeKVEntryReaderToJsonl(sourceReader, &encodedKVEntries)
	if err != nil {
		t.Errorf("unexpected encode error %v", err)
	}

	jsonlReader := NewJsonlKVEntryDecoderReader(io.NopCloser(&encodedKVEntries))

	got1, err := jsonlReader.Read()
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	checkSameKVEntry(t, got1, source[0])

	got2, err := jsonlReader.Read()
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	checkSameKVEntry(t, got2, source[1])

	_, err = jsonlReader.Read()
	if err != io.EOF {
		t.Errorf("expected error io.EOF, got %v", err)
	}

	err = jsonlReader.Close()
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}
