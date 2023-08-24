import { WalletName } from '@agoric/internal';
import { getCopyMapEntries, makeCopyMap } from '@agoric/store';
import { E } from '@endo/far';

const { Fail } = assert;

/**
 * @param {ERef<import('@agoric/vats').NameAdmin>} nameAdmin
 * @param {string[][]} paths
 */
export const reserveThenGetNamePaths = async (nameAdmin, paths) => {
  /**
   * @param {ERef<import('@agoric/vats').NameAdmin>} nextAdmin
   * @param {string[]} path
   */
  const nextPath = async (nextAdmin, path) => {
    const [nextName, ...rest] = path;
    assert.typeof(nextName, 'string');

    // Ensure we wait for the next name until it exists.
    await E(nextAdmin).reserve(nextName);

    if (rest.length === 0) {
      // Now return the readonly lookup of the name.
      const nameHub = E(nextAdmin).readonly();
      return E(nameHub).lookup(nextName);
    }

    // Wait until the next admin is resolved.
    const restAdmin = await E(nextAdmin).lookupAdmin(nextName);
    return nextPath(restAdmin, rest);
  };

  return Promise.all(
    paths.map(async path => {
      Array.isArray(path) || Fail`path ${path} is not an array`;
      return nextPath(nameAdmin, path);
    }),
  );
};

/**
 * @param {ERef<import('@agoric/vats').NameAdmin>} nameAdmin
 * @param {string[]} names
 */
export const reserveThenGetNames = async (nameAdmin, names) =>
  reserveThenGetNamePaths(
    nameAdmin,
    names.map(name => [name]),
  );

/**
 * @param {string} debugName
 * @param {ERef<import('@agoric/vats').NameAdmin>} namesByAddressAdmin
 * @param {string} addr
 * @param {ERef<Payment>[]} payments
 */
export const reserveThenDeposit = async (
  debugName,
  namesByAddressAdmin,
  addr,
  payments,
) => {
  console.info('awaiting depositFacet for', debugName);
  const [depositFacet] = await reserveThenGetNamePaths(namesByAddressAdmin, [
    [addr, WalletName.depositFacet],
  ]);
  console.info('depositing to', debugName);
  await Promise.allSettled(
    payments.map(async (paymentP, i) => {
      const payment = await paymentP;
      await E(depositFacet).receive(payment);
      console.info(
        `confirmed deposit ${i + 1}/${payments.length} for`,
        debugName,
      );
    }),
  );
};

/**
 * @type {<T>(
 *   store: ERef<
 *     Map<string, T> | import('@agoric/internal/src/scratch.js').ScratchPad
 *   >,
 *   key: string,
 *   make: () => T,
 * ) => Promise<T>}
 */
const provideWhen = async (store, key, make) => {
  const found = await E(store).get(key);
  if (found) {
    return found;
  }
  const value = make();
  await E(store).set(key, value);
  return value;
};

/**
 * @param {{
 *   scratch: ERef<import('@agoric/internal/src/scratch.js').ScratchPad>;
 * }} homeP
 * @param {object} opts
 * @param {(specifier: string) => Promise<{ default: Bundle }>} opts.loadBundle
 * @param {string} [opts.installCacheKey]
 */
export const makeInstallCache = async (
  homeP,
  { installCacheKey = 'installCache', loadBundle },
) => {
  /**
   * @type {CopyMap<
   *   string,
   *   { installation: Installation; boardId: string; path?: string }
   * >}
   */
  const initial = await provideWhen(E.get(homeP).scratch, installCacheKey, () =>
    makeCopyMap([]),
  );
  // ISSUE: getCopyMapEntries of CopyMap<K, V> loses K, V.
  /** @type {Map<string, { installation: Installation }>} */
  const working = new Map(getCopyMapEntries(initial));

  const saveCache = async () => {
    const final = makeCopyMap(working);
    assert.equal(final.payload.keys.length, working.size);
    await E(E.get(homeP).scratch).set(installCacheKey, final);
    console.log({
      initial: initial.payload.keys.length,
      total: working.size,
    });
  };

  /**
   * @template {(
   *   mPath: string,
   *   bPath: string,
   *   opts: object,
   * ) => Promise<Installation<T>>} T
   * @param {T} install
   * @returns {T}
   */
  const wrapInstall = install => async (mPath, bPath, opts) => {
    const bundle = await loadBundle(bPath).then(m => m.default);
    assert(
      'endoZipBase64Sha512' in bundle,
      'bundle must be EndoZipBase64Bundle',
    );
    const { endoZipBase64Sha512: sha512 } = bundle;
    const detail = await provideWhen(working, sha512, () =>
      // @ts-expect-error FIXME one of these is wrong: install, provideWhen, working
      install(mPath, bPath, opts).then(installation => ({
        installation,
        sha512,
        path: bPath,
      })),
    );
    return /** @type {Installation<T>} */ (detail.installation);
  };

  return { wrapInstall, saveCache };
};
