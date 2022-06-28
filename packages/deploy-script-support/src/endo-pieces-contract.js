// @ts-check
// @jessie-check
import { E, Far } from '@endo/far';
import { encodeBase64, decodeBase64 } from '@endo/base64';
import { ZipWriter } from '@endo/zip';

const { details: X, quote: q } = assert;

export const start = () => {
  /** @type { Map<string, [string, Uint8Array]>} */
  const hashToEntry = new Map();

  /** @param {string[]} hashes */
  const preFilter = hashes => {
    assert(Array.isArray(hashes));
    return hashes.filter(hash => {
      assert.typeof(hash, 'string');
      return hashToEntry.has(hash);
    });
  };

  const makeBundler = ({ zoe }) => {
    /** @type { Map<string, [string, Uint8Array]>} */
    const nameToContent = new Map();

    return Far('Bundler', {
      preFilter,
      /**
       * @param {string} name
       * @param {string} encodedContent
       * @param {string} hash
       */
      add: (name, encodedContent, hash) => {
        assert.typeof(name, 'string');
        assert.typeof(encodedContent, 'string');
        assert.typeof(hash, 'string');
        // TODO: verify hash
        nameToContent.set(name, [
          hash,
          new Uint8Array(decodeBase64(encodedContent)),
        ]);
      },
      /**
       * @param {string} name
       * @param {string} hash
       */
      addByRef: (name, hash) => {
        const entry = hashToEntry.get(hash);
        assert(entry, X`hash not found: ${q(hash)}`);
        const [_n, content] = entry;
        nameToContent.set(name, [hash, content]);
      },
      persist: () => {
        for (const [name, [hash, content]] of nameToContent.entries()) {
          hashToEntry.set(hash, [name, content]);
        }
      },
      /** @param {{ moduleFormat: string}} bundleShell */
      install: bundleShell => {
        const writer = new ZipWriter();
        for (const [name, [_hash, content]] of nameToContent.entries()) {
          writer.write(name, content);
        }
        const endoZipBase64 = encodeBase64(writer.snapshot());
        const bundle = { ...bundleShell, endoZipBase64 };
        return E(zoe)
          .install(bundle)
          .finally(() => nameToContent.clear());
      },
      clear: () => {
        nameToContent.clear();
      },
    });
  };

  const publicFacet = Far('endoCAS', {
    makeBundler,
    preFilter,
  });

  return harden({ publicFacet });
};
harden(start);
