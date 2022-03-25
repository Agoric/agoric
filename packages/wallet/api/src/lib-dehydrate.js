// @ts-check

import { makeMarshal, mapIterable } from '@endo/marshal';
import { makeLegacyMap, makeScalarMap } from '@agoric/store';
import { assert, details as X, q } from '@agoric/assert';

/**
 * @typedef {string[]} Path
 *
 * @typedef {{} & 'Strongname'} Strongname
 * @param {any} x
 * @returns {x is Path}
 */
export const isPath = x => {
  if (!Array.isArray(x)) {
    return false;
  }
  assert(x.length > 0, X`Path ${q(x)} must not be empty`);
  for (const name of x) {
    if (typeof name !== 'string') {
      return false;
    }
  }
  return true;
};

const IMPLODE_PREFIX = 'IE:';

// Marshalling for the UI should only use the user's petnames. We will
// call marshalling for the UI "dehydration" and "hydration" to distinguish it
// from other marshalling.
export const makeDehydrator = (initialUnnamedCount = 0) => {
  let unnamedCount = initialUnnamedCount;

  // Legacy because Mappings mix functions and data
  const petnameKindToMapping = makeLegacyMap('petnameKind');

  /** @type {string[]} */
  const searchOrder = [];

  // Paths are kept across all kinds.
  // TODO What about when useLegacyMap is true because contact have
  // identity?
  /** @type {Store<any, Path[]>} */
  const valToPaths = makeScalarMap('value');

  /**
   * @param {string} data
   * @returns {string | Path}
   */
  const explode = data => {
    assert(
      data.startsWith(IMPLODE_PREFIX),
      X`exploded string ${data} must start with ${q(IMPLODE_PREFIX)}`,
    );
    const strongname = JSON.parse(data.slice(IMPLODE_PREFIX.length));
    if (!isPath(strongname)) {
      return strongname;
    }
    // eslint-disable-next-line no-use-before-define
    const { valToPetname: rootToPetname } = edgeMapping;
    const petname = rootToPetname.get(strongname[0]);
    assert(!isPath(petname));
    strongname[0] = petname;
    return harden(strongname);
  };

  /**
   * @param {string | Path} strongname
   * @returns {string}
   */
  const implode = strongname => {
    if (!isPath(strongname)) {
      return `${IMPLODE_PREFIX}${JSON.stringify(strongname)}`;
    }

    // A strong path must have a root name we have mapped.
    const path = [...strongname];
    // eslint-disable-next-line no-use-before-define
    const { petnameToVal: petnameToRoot } = edgeMapping;
    if (!petnameToRoot.has(path[0])) {
      // Avoid asserting, which fills up the logs.
      assert.fail(X`Edgename for ${q(path[0])} petname not found`);
    }
    const root = petnameToRoot.get(path[0]);
    path[0] = root;

    return `${IMPLODE_PREFIX}${JSON.stringify(path)}`;
  };

  /**
   * @template T
   * @param {string} kind
   * @param {{ useLegacyMap?: boolean }} [legacyOptions]
   * @returns {Mapping<T>}
   */
  const makeMapping = (kind, { useLegacyMap = false } = {}) => {
    assert.typeof(kind, 'string', X`kind ${kind} must be a string`);
    const makeMap = useLegacyMap ? makeLegacyMap : makeScalarMap;
    // These are actually either a LegacyMap or a MapStore depending on
    // useLegacyMap. Fortunately, the LegacyMap type is approximately the
    // intersection of these, so we can just use it.
    /** @type {LegacyMap<T, string>} */
    const rawValToPetname = makeMap('value');
    /** @type {LegacyMap<T, string | Path>} */
    const valToPetname = {
      ...rawValToPetname,
      set(key, val) {
        rawValToPetname.set(key, implode(val));
      },
      init(key, val) {
        rawValToPetname.init(key, implode(val));
      },
      get(key) {
        return explode(rawValToPetname.get(key));
      },
      entries() {
        return mapIterable(rawValToPetname.entries(), ([key, val]) => [
          key,
          explode(val),
        ]);
      },
      values() {
        return mapIterable(rawValToPetname.values(), val => explode(val));
      },
    };
    /** @type {Store<string, T>} */
    const rawPetnameToVal = makeScalarMap('petname');
    /** @type {Store<Path | string, T>} */
    const petnameToVal = {
      ...rawPetnameToVal,
      init(key, val) {
        return rawPetnameToVal.init(implode(key), val);
      },
      set(key, val) {
        return rawPetnameToVal.set(implode(key), val);
      },
      has(key) {
        try {
          return rawPetnameToVal.has(implode(key));
        } catch (e) {
          // console.error(e);
          return false;
        }
      },
      get(key) {
        return rawPetnameToVal.get(implode(key));
      },
      delete(key) {
        return rawPetnameToVal.delete(implode(key));
      },
      keys() {
        return mapIterable(rawPetnameToVal.keys(), key => explode(key));
      },
      entries() {
        return mapIterable(rawPetnameToVal.entries(), ([key, val]) => [
          explode(key),
          val,
        ]);
      },
    };

    /**
     * @param {Path} path
     * @param {any} val
     */
    const addPath = (path, val) => {
      assert(isPath(path), X`path ${q(path)} must be an array of strings`);

      if (
        !valToPetname.has(val) &&
        // eslint-disable-next-line no-use-before-define
        edgeMapping.valToPetname.has(path[0])
      ) {
        // We have a petname for the root of the path, so use it as our
        // strongname.
        valToPetname.init(val, path);
      }

      // Check all the extant paths for this value.
      if (!valToPaths.has(val)) {
        valToPaths.init(val, harden([path]));
        return;
      }
      const paths = valToPaths.get(val);

      // See if we already have the path in the list.
      const found = paths.find(ename => {
        if (ename.length !== path.length) {
          return false;
        }
        for (let i = 0; i < ename.length; i += 1) {
          if (ename[i] !== path[i]) {
            return false;
          }
        }
        return true;
      });

      // Set the new path if not found.
      if (!found) {
        valToPaths.set(val, harden([...paths, path]));
      }
    };

    const addPetname = (petname, val) => {
      if (petnameToVal.has(petname) && petnameToVal.get(petname) === val) {
        return;
      }
      assert(
        !petnameToVal.has(petname),
        X`petname ${petname} is already in use`,
      );
      assert(!valToPetname.has(val), X`val ${val} already has a petname`);
      petnameToVal.init(petname, val);
      valToPetname.init(val, petname);

      if (isPath(petname)) {
        addPath(petname, val);
      }
    };

    const renamePetname = (petname, val) => {
      assert(
        valToPetname.has(val),
        X`val ${val} has not been previously named, would you like to add it instead?`,
      );
      assert(
        !petnameToVal.has(petname),
        X`petname ${petname} is already in use`,
      );
      // Delete the old mappings.
      const oldPetname = valToPetname.get(val);
      petnameToVal.delete(oldPetname);
      valToPetname.delete(val);

      // Add the new mappings.
      petnameToVal.init(petname, val);
      valToPetname.init(val, petname);
    };

    /**
     * @param {Petname} petname
     * @param {any} val
     * @returns {Petname}
     */
    const suggestPetname = (petname, val) => {
      if (valToPetname.has(val)) {
        // Already have a petname, so just return it.
        return valToPetname.get(val);
      }

      // Find a unique path.
      let uniquePath = petname;
      let nonce = 2;
      while (petnameToVal.has(uniquePath)) {
        // Add the nonce to the path, and try again.
        if (isPath(petname)) {
          uniquePath = [...petname, `${nonce}`];
        } else {
          uniquePath = `${petname}${nonce}`;
        }
        nonce += 1;
      }

      // We must be unique now, so add the path.
      // The validity of the path will still be determined by whether
      // we have a petname for its edge (first element).
      addPetname(uniquePath, val);
      return uniquePath;
    };

    const deletePetname = petname => {
      assert(
        petnameToVal.has(petname),
        X`petname ${q(
          petname,
        )} has not been previously named, would you like to add it instead?`,
      );

      // Delete the mappings.
      const val = petnameToVal.get(petname);
      petnameToVal.delete(petname);
      valToPetname.delete(val);
    };
    /** @type {Mapping<T>} */
    const mapping = harden({
      implode,
      explode,
      valToPetname,
      valToPaths,
      petnameToVal,
      addPetname,
      addPath,
      renamePetname,
      deletePetname,
      suggestPetname,
      kind,
    });
    petnameKindToMapping.init(kind, mapping);
    return mapping;
  };

  const edgeMapping = makeMapping('edge');
  const unnamedMapping = makeMapping('unnamed');

  const addToUnnamed = val => {
    unnamedCount += 1;
    const placeholder = `unnamed-${unnamedCount}`;
    unnamedMapping.addPetname(placeholder, val);
    const placeholderName = harden({
      kind: 'unnamed',
      petname: placeholder,
    });
    return placeholderName;
  };

  // look through the petname stores in order and create a new
  // unnamed record if not found.
  const convertValToName = val => {
    for (let i = 0; i < searchOrder.length; i += 1) {
      const kind = searchOrder[i];
      const { valToPetname } = petnameKindToMapping.get(kind);
      if (valToPetname.has(val)) {
        return harden({
          kind,
          petname: valToPetname.get(val),
        });
      }
    }
    // Val was not found in any named petname map. It may be in
    // unnamedMapping already.
    if (unnamedMapping.valToPetname.has(val)) {
      return harden({
        kind: 'unnamed',
        petname: unnamedMapping.valToPetname.get(val),
      });
    }
    // Val was not found anywhere, so we need to add it.
    const placeholderName = addToUnnamed(val);
    return placeholderName;
  };

  const convertNameToVal = ({ kind, petname }, _iface = undefined) => {
    const { petnameToVal } = petnameKindToMapping.get(kind);
    return petnameToVal.get(petname);
  };

  const { serialize: dehydrate, unserialize: hydrate } = makeMarshal(
    convertValToName,
    convertNameToVal,
    {
      marshalName: 'hydration',
      // TODO Temporary hack.
      // See https://github.com/Agoric/agoric-sdk/issues/2780
      errorIdNum: 30000,
    },
  );
  return harden({
    hydrate,
    dehydrate,
    edgeMapping,
    /**
     * @template T
     * @param {string} kind
     * @param {{ useLegacyMap?: boolean }} [legacyOptions]
     * @returns {Mapping<T>}
     */
    makeMapping: (kind, legacyOptions = undefined) => {
      const mapping = makeMapping(kind, legacyOptions);
      searchOrder.push(kind);
      return mapping;
    },
  });
};
