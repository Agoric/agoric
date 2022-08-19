import { assert } from '@agoric/assert';
import { stringify, parse } from '@endo/marshal';
import { insistVatID } from '../lib/id.js';

export function makeVatAdminHooks(tools) {
  const { kernelKeeper, terminateVat } = tools;
  return {
    createByBundle(argsCapData) {
      // first, split off vatParameters
      const argsJSON = JSON.parse(argsCapData.body);
      const [bundle, { vatParameters: vpJSON, ...dynamicOptionsJSON }] =
        argsJSON;
      // assemble the vatParameters capdata
      const vatParameters = {
        body: JSON.stringify(vpJSON),
        slots: argsCapData.slots,
      };
      // then re-parse the rest with marshal
      const dynamicOptions = parse(JSON.stringify(dynamicOptionsJSON));
      // incref slots while create-vat is on run-queue
      for (const kref of vatParameters.slots) {
        kernelKeeper.incrementRefCount(kref, 'create-vat-event');
      }
      const source = { bundle };
      const vatID = kernelKeeper.allocateUnusedVatID();
      const event = {
        type: 'create-vat',
        vatID,
        source,
        vatParameters,
        dynamicOptions,
      };
      kernelKeeper.addToAcceptanceQueue(harden(event));
      // the device gets the new vatID immediately, and will be notified
      // later when it is created and a root object is available
      const vatIDCapData = { body: JSON.stringify(vatID), slots: [] };
      return harden(vatIDCapData);
    },

    createByID(argsCapData) {
      // argsCapData is marshal([bundleID, options]), and options is {
      // vatParameters, ...rest }, and 'rest' is JSON-serializable (no
      // slots or bigints or undefined). We get the intermediate marshal
      // representation (with @qclass nodes), carve off vatParameters,
      // then reassemble the rest. All slots will be associated with
      // vatParameters.

      // first, split off vatParameters
      const argsJSON = JSON.parse(argsCapData.body);
      const [bundleID, { vatParameters: vpJSON, ...dynamicOptionsJSON }] =
        argsJSON;
      assert(kernelKeeper.hasBundle(bundleID), bundleID);
      // assemble the vatParameters capdata
      const vatParameters = {
        body: JSON.stringify(vpJSON),
        slots: argsCapData.slots,
      };
      // then re-parse the rest with marshal
      const dynamicOptions = parse(JSON.stringify(dynamicOptionsJSON));
      // incref slots while create-vat is on run-queue
      for (const kref of vatParameters.slots) {
        kernelKeeper.incrementRefCount(kref, 'create-vat-event');
      }
      const source = { bundleID };
      const vatID = kernelKeeper.allocateUnusedVatID();
      const event = {
        type: 'create-vat',
        vatID,
        source,
        vatParameters,
        dynamicOptions,
      };
      kernelKeeper.addToAcceptanceQueue(harden(event));
      // the device gets the new vatID immediately, and will be notified
      // later when it is created and a root object is available
      const vatIDCapData = { body: JSON.stringify(vatID), slots: [] };
      return harden(vatIDCapData);
    },

    upgrade(argsCapData) {
      // marshal([vatID, bundleID, vatParameters]) -> upgradeID
      const argsJSON = JSON.parse(argsCapData.body);
      const [vatID, bundleID, vpJSON, upgradeMessage] = argsJSON;
      insistVatID(vatID);
      assert.typeof(bundleID, 'string');
      assert.typeof(upgradeMessage, 'string');
      const vpCD = { body: JSON.stringify(vpJSON), slots: argsCapData.slots };
      for (const kref of vpCD.slots) {
        kernelKeeper.incrementRefCount(kref, 'upgrade-vat-event');
      }
      const upgradeID = kernelKeeper.allocateUpgradeID();
      const ev = {
        type: 'upgrade-vat',
        vatID,
        upgradeID,
        bundleID,
        vatParameters: vpCD,
        upgradeMessage,
      };
      kernelKeeper.addToAcceptanceQueue(harden(ev));
      const upgradeIDCD = { body: JSON.stringify(upgradeID), slots: [] };
      return harden(upgradeIDCD);
    },

    terminate(argsCD) {
      // marshal([vatID, reason]) -> null
      const argsJSON = JSON.parse(argsCD.body);
      const [vatID, reasonJSON] = argsJSON;
      insistVatID(vatID);
      const reasonCD = { ...argsCD, body: JSON.stringify(reasonJSON) };
      // we don't need to incrementRefCount because if terminateVat sends
      // 'reason' to vat-admin, it uses notifyTermination / queueToKref /
      // doSend, and doSend() does its own incref
      void terminateVat(vatID, true, reasonCD);
      // TODO: terminateVat is async, result doesn't fire until worker
      // is dead. To fix this we'll probably need to move termination
      // to a run-queue ['terminate-vat', vatID] event, like createVat
      return harden({ body: stringify(undefined), slots: [] });
    },

    changeOptions(argsCapData) {
      // marshal([vatID, options]) -> null
      assert.equal(argsCapData.slots.length, 0);
      const args = JSON.parse(argsCapData.body);
      const [vatID, options] = args;
      insistVatID(vatID);
      const ev = {
        type: 'changeVatOptions',
        vatID,
        options,
      };
      kernelKeeper.addToAcceptanceQueue(harden(ev));
      return harden({ body: stringify(undefined), slots: [] });
    },
  };
}
