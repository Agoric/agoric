import assert from 'node:assert';
import { agoric, executeOffer, queryVstorage } from '@agoric/synthetic-chain';
import { makeMarshal, Remotable } from '@endo/marshal';

const slotToRemotable = (_slotId, iface = 'Remotable') =>
  Remotable(iface, undefined, {
    getBoardId: () => _slotId,
  });

// /** @param {BoardRemote | object} val */
const boardValToSlot = val => {
  if ('getBoardId' in val) {
    return val.getBoardId();
  }
  throw Error(`unknown obj in boardSlottingMarshaller.valToSlot ${val}`);
};

const boardSlottingMarshaller = slotToVal => {
  return makeMarshal(boardValToSlot, slotToVal, {
    serializeBodyFormat: 'smallcaps',
  });
};

export const marshaller = boardSlottingMarshaller(slotToRemotable);

/** @param {string} path */
export const queryVstorageFormatted = async (path, index = -1) => {
  const data = await queryVstorage(path);
  const formattedData = JSON.parse(data.value);
  const formattedDataAtIndex = JSON.parse(formattedData.values.at(index));
  return marshaller.fromCapData(formattedDataAtIndex);
};

export const acceptInvitation = async (
  address,
  instanceName,
  description,
  offerId,
) => {
  const instanceDataRaw = await agoric.follow(
    '-lF',
    ':published.agoricNames.instance',
    '-o',
    'text',
  );
  const instance = Object.fromEntries(
    marshaller.fromCapData(JSON.parse(instanceDataRaw)),
  );
  assert(instance[instanceName]);
  const id = offerId || `econ-${Date.now()}`;
  const body = {
    method: 'executeOffer',
    offer: {
      id: id,
      invitationSpec: {
        source: 'purse',
        instance: instance[instanceName],
        description,
      },
      proposal: {},
    },
  };

  const capData = marshaller.toCapData(harden(body));
  return executeOffer(address, JSON.stringify(capData));
};
