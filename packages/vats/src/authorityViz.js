/* eslint-disable no-continue */
// @ts-check
import '@endo/init';
import process from 'process';

import * as manifests from './core/manifest.js';

const { entries } = Object;

const styles = {
  vatPowers: 'shape=star, style=filled, fillcolor=aqua',
  vats: 'shape=doubleoctagon, style=filled, fillcolor=tomato',
  vat: 'shape=doubleoctagon, style=filled, fillcolor=tomato3',
  devices: 'shape=box, style=filled, fillcolor=gold',
  space: 'shape=house, style=filled, fillcolor=khaki',
  issuer: 'shape=trapezium, style=filled, fillcolor=chocolate',
  brand: 'shape=Mcircle, style=filled, fillcolor=chocolate2',
  installation: 'shape=cylinder',
  instance: 'shape=component',
  home: 'shape=folder',
};

/**
 * @param {Set<GraphNode>} nodes
 * @param {Map<string, Set<{ id: string; style?: string }>>} neighbors
 * @yields {string}
 *
 * @typedef {{
 *   id: string;
 *   cluster?: string;
 *   label: string;
 *   style?: string;
 * }} GraphNode
 */
function* fmtGraph(nodes, neighbors) {
  const q = txt => JSON.stringify(txt.replace(/\./g, '_'));
  yield 'digraph G {\n';
  yield 'rankdir = LR;\n';
  const clusters = new Set(
    [...nodes].map(({ cluster }) => cluster).filter(c => !!c),
  );
  for (const subgraph of [...clusters, undefined]) {
    if (subgraph) {
      assert.typeof(subgraph, 'string');
      yield `subgraph cluster_${subgraph} {\n`;
      yield `label = "${subgraph}"\n`;
    }
    for (const { id, cluster, label, style } of nodes) {
      if (subgraph && cluster !== subgraph) continue;
      yield `${q(id)} [label=${q(label)}${style ? `, ${style}` : ''}];\n`;
    }
    if (subgraph) {
      yield `}\n`;
    }
  }
  for (const [src, arcs] of neighbors.entries()) {
    for (const { id, style } of arcs) {
      yield `${q(src)} -> ${q(id)} [${style}]\n`;
    }
  }
  yield '}\n';
}

/**
 * @param {Record<string, Permit>} manifest
 *
 * @typedef {{
 *   vatParameters?: Record<string, unknown>;
 *   vatPowers?: Record<string, boolean>;
 *   vats?: Record<string, boolean>;
 *   devices?: Record<string, boolean>;
 *   home?: PowerSpace;
 *   issuer?: PowerSpace;
 *   brand?: PowerSpace;
 *   installation?: PowerSpace;
 *   instance?: PowerSpace;
 *   runBehaviors: Function;
 * } & PowerSpace} Permit
 *
 * @typedef {{
 *   produce?: Record<string, Status>;
 *   consume?: Record<string, Status>;
 * }} PowerSpace
 *
 * @typedef {boolean | VatName} Status
 *
 * @typedef {string} VatName
 */
const manifest2graph = manifest => {
  /** @type {Set<GraphNode>} */
  const nodes = new Set();
  const neighbors = new Map();

  /**
   * @param {string} src
   * @param {string} dest
   * @param {string} [style]
   */
  const addEdge = (src, dest, style = '') => {
    if (!neighbors.has(src)) {
      neighbors.set(src, new Set());
    }
    neighbors.get(src).add({ id: dest, style });
  };

  /**
   * @param {string} src
   * @param {string} ty
   * @param {Record<string, Status> | undefined} item
   * @param {boolean} [reverse]
   */
  const level1 = (src, ty, item, reverse = false) => {
    if (item) {
      for (const [powerName, status] of entries(item)) {
        // subsumed by permits for vat:, home:, ...
        if (
          [
            'loadVat',
            'client',
            'agoricNames',
            'nameHubs',
            'nameAdmins',
          ].includes(powerName) &&
          reverse
        )
          continue;
        if (status) {
          let cluster = {};
          if (typeof status !== 'boolean') {
            cluster = { cluster: status };
          }

          nodes.add({
            id: `${ty}.${powerName}`,
            label: powerName,
            style: styles[ty],
            ...cluster,
          });
          addEdge(src, `${ty}.${powerName}`, reverse ? 'dir=back' : '');
          if (ty === 'home') {
            nodes.add({ id: 'home', label: 'home', cluster: 'provisioning' });
            addEdge('home', `${ty}.${powerName}`);
          }
        }
      }
    }
  };

  for (const [fnName, permit] of entries(manifest)) {
    nodes.add({ id: fnName, label: fnName });

    level1(fnName, 'vatPowers', permit.vatPowers, true);
    level1(fnName, 'vats', permit.vats, true);
    level1(fnName, 'devices', permit.devices, true);
    level1(fnName, 'space', permit.produce);
    level1(fnName, 'space', permit.consume, true);
    level1(fnName, 'home', (permit.home || {}).produce);
    level1(fnName, 'issuer', (permit.issuer || {}).produce);
    level1(fnName, 'issuer', (permit.issuer || {}).consume, true);
    level1(fnName, 'brand', (permit.brand || {}).produce);
    level1(fnName, 'brand', (permit.brand || {}).consume, true);
    level1(fnName, 'installation', (permit.installation || {}).produce);
    level1(fnName, 'installation', (permit.installation || {}).consume, true);
    level1(fnName, 'instance', (permit.instance || {}).produce);
    level1(fnName, 'instance', (permit.instance || {}).consume, true);
    if (permit.runBehaviors) {
      nodes.add({
        id: `runBehaviors`,
        label: `runBehaviors`,
        style: '',
      });
      addEdge(fnName, `runBehaviors`);
    }
  }
  return { nodes, neighbors };
};

/**
 * @param {string[]} args
 * @param {Object} io
 * @param {typeof import('process').stdout} io.stdout
 */
const main = async (args, { stdout }) => {
  const [...opts] = args;
  // if (!fn) throw Error('usage: authorityViz [--sim-chain]');
  const [sim, gov] = ['--sim-chain', '--gov'].map(opt => opts.includes(opt));
  let manifest = sim
    ? manifests.SIM_CHAIN_BOOTSTRAP_MANIFEST
    : manifests.CHAIN_BOOTSTRAP_MANIFEST;
  if (gov) {
    const postBoot = sim
      ? manifests.SIM_CHAIN_POST_BOOT_MANIFEST
      : manifests.CHAIN_POST_BOOT_MANIFEST;
    manifest = { ...postBoot, ...manifest };
  }

  // console.log(JSON.stringify(bootstrapManifest, null, 2));
  const g = manifest2graph(/** @type {any} */ (manifest));
  for (const chunk of fmtGraph(g.nodes, g.neighbors)) {
    stdout.write(chunk);
  }
};

(async () => {
  return main(process.argv.slice(2), {
    stdout: process.stdout,
  });
})().catch(console.error);
