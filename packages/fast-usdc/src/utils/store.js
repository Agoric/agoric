import { Fail } from '@endo/errors';

/**
 * @import {Key} from '@endo/patterns';
 */

// TODO provide something like this in a more common place, perhaps as a BagStore
/**
 * Creates a bag (multi-set) API that wraps a MapStore where values are counts.
 *
 * @template {Key} K
 * @param {MapStore<K, number>} mapStore
 */
export const asMultiset = mapStore =>
  harden({
    /**
     * Add an item to the bag, incrementing its count.
     *
     * @param {K} item The item to add
     * @param {number} [count] How many to add (defaults to 1)
     */
    add: (item, count = 1) => {
      if (count <= 0) {
        throw Fail`Cannot add a non-positive count ${count} to bag`;
      }

      if (mapStore.has(item)) {
        const currentCount = mapStore.get(item);
        mapStore.set(item, currentCount + count);
      } else {
        mapStore.init(item, count);
      }
    },

    /**
     * Remove an item from the bag, decrementing its count. If count reaches
     * zero, the item is removed completely.
     *
     * @param {K} item The item to remove
     * @param {number} [count] How many to remove (defaults to 1)
     * @returns {boolean} Whether the removal was successful
     */
    remove: (item, count = 1) => {
      if (count <= 0) {
        throw Fail`Cannot remove a non-positive count ${count} from bag`;
      }

      if (!mapStore.has(item)) {
        return false;
      }

      const currentCount = mapStore.get(item);
      if (currentCount <= count) {
        mapStore.delete(item);
      } else {
        mapStore.set(item, currentCount - count);
      }
      return true;
    },

    /**
     * Get the count of an item in the bag.
     *
     * @param {K} item The item to check
     * @returns {number} The count (0 if not present)
     */
    count: item => {
      return mapStore.has(item) ? mapStore.get(item) : 0;
    },

    /**
     * Check if the bag contains at least one of the item.
     *
     * @param {K} item The item to check
     * @returns {boolean} Whether the item is in the bag
     */
    has: item => {
      return mapStore.has(item);
    },

    /**
     * Get all unique items in the bag.
     *
     * @returns {Iterable<K>} Iterable of unique items
     */
    keys: () => {
      return mapStore.keys();
    },

    /**
     * Get all entries (item, count) in the bag.
     *
     * @returns {Iterable<[K, number]>} Iterable of [item, count] pairs
     */
    entries: () => {
      return mapStore.entries();
    },

    /**
     * Get the total number of unique items in the bag.
     *
     * @returns {number} Number of unique items
     */
    size: () => {
      return mapStore.getSize();
    },

    /**
     * Remove all items from the bag.
     */
    clear: () => {
      mapStore.clear();
    },
  });
