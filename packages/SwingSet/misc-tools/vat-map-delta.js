// @ts-nocheck
import '@endo/init';
import fs from 'fs';
import process from 'process';

// run this against maps created by vat-map-from-swingstore.js, like:
//  node vat-map-delta.js vat-map-04.json vat-map-05.json
//
// It will print a list of changes between the two snapshots, which
// will show:
// * created vats
// * deleted vats
// * vats which have been upgraded
//
// Vat upgrades may show changes to the initial bundle (ZCF for
// contract vats), the secondary contract bundle (if any), the
// bundleID of the lockdown and/or supervisor bundles, etc.
//
// Add --as-json to get the output in a machine-readable format

let asJSON = false;
const args = [];
for (const arg of process.argv.slice(2)) {
  if (arg === '--as-json') {
    asJSON = true;
  } else {
    args.push(arg);
  }
}
const [previousPath, newPath] = args;
assert(fs.existsSync(previousPath), `missing previousPath: ${previousPath}`);
assert(fs.existsSync(newPath), `missing newPath: ${newPath}`);
const oldData = JSON.parse(fs.readFileSync(previousPath));
const newData = JSON.parse(fs.readFileSync(newPath));

const { keys } = Object;

const changes = {}; // ${vatID}.${key} -> [oldValue, newValue]

if (oldData.currentZCF !== newData.currentZCF) {
  changes.currentZCF = [oldData.currentZCF, newData.currentZCF];
}

const vatIDs = new Set([...keys(oldData.vats), ...keys(newData.vats)]);
for (const vatID of vatIDs) {
  const oldVatData = oldData.vats[vatID] || {};
  const newVatData = newData.vats[vatID] || {};
  const vkeys = new Set([...keys(oldVatData), ...keys(newVatData)]);
  for (const vkey of vkeys) {
    if (vkey === 'endPos') continue;
    const oldValue = oldVatData[vkey];
    const newValue = newVatData[vkey];
    if (newValue !== oldValue) {
      changes[`${vatID}.${vkey}`] = [oldValue, newValue];
    }
  }
}

if (keys(changes).length) {
  if (asJSON) {
    console.log(JSON.stringify(changes));
  } else {
    console.log(`-- CHANGES:`);
    for (const [key, value] of Object.entries(changes)) {
      console.log(`${key}: ${value[0]} -> ${value[1]}`);
    }
  }
}
