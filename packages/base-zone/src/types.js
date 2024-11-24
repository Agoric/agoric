// eslint-disable-next-line no-unused-vars
import { makeExo, defineExoClass, defineExoClassKit } from '@endo/exo';
// eslint-disable-next-line no-unused-vars
import { watchPromise } from './watch-promise.js';

// Ensure this is a module.
export {};

/**
 * @import {Key} from '@endo/patterns';
 * @import {Passable} from '@endo/pass-style';
 */

/** @typedef {'exoClass' | 'exoClassKit' | 'exo' | 'store' | 'zone'} KeyCategories */
/** @typedef {Record<KeyCategories, (label: string) => string[]>} KeyMakers */

/**
 * @typedef {ExoZone & Stores} Zone A bag of methods for creating defensible objects and
 * collections with the same allocation semantics (ephemeral, persistent, etc)
 */

/**
 * @typedef {object} ExoZone
 * @property {typeof makeExo} exo create a singleton exo-object instance bound to this zone
 * @property {typeof defineExoClass} exoClass create a maker function that can be used to create exo-objects bound to this zone
 * @property {typeof defineExoClassKit} exoClassKit create a "kit" maker function that can be used to create a record of exo-objects sharing the same state
 * @property {<T>(key: string, maker: (key: string) => T) => T} makeOnce create or retrieve a singleton object bound to this zone
 * @property {(label: string, options?: StoreOptions) => Zone} subZone create a new Zone that can be passed to untrusted consumers without exposing the storage of the parent zone
 * @property {typeof watchPromise} watchPromise register a promise watcher created by this zone
 */

/**
 * @typedef {object} Stores
 * @property {() => Stores} detached obtain store providers which are detached (the stores are anonymous rather than bound to `label` in the zone)
 * @property {(specimen: unknown) => boolean} isStorable return true if the specimen can be stored in the zone, whether as exo-object state or in a store
 * @property {<K, V>(label: string, options?: StoreOptions) => MapStore<K, V>} mapStore provide a Map-like store named `label` in the zone
 * @property {<K>(label: string, options?: StoreOptions) => SetStore<K>} setStore provide a Set-like store named `label` in the zone
 * @property {<K, V>(
 *   label: string, options?: StoreOptions) => WeakMapStore<K, V>
 * } weakMapStore provide a WeakMap-like store named `label` in the zone
 * @property {<K>(
 *   label: string, options?: StoreOptions) => WeakSetStore<K>
 * } weakSetStore provide a WeakSet-like store named `label` in the zone
 */
