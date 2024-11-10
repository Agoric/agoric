//@ts-nocheck
import { type Rpc } from '../../helpers.js';
import { BinaryReader } from '../../binary.js';
import { MsgSendPacket, MsgSendPacketResponse } from './msgs.js';
/** The module transactions. */
export interface Msg {
  /** Force sending an arbitrary packet on a channel. */
  sendPacket(request: MsgSendPacket): Promise<MsgSendPacketResponse>;
}
export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.sendPacket = this.sendPacket.bind(this);
  }
  sendPacket(request: MsgSendPacket): Promise<MsgSendPacketResponse> {
    const data = MsgSendPacket.encode(request).finish();
    const promise = this.rpc.request('agoric.vibc.Msg', 'SendPacket', data);
    return promise.then(data =>
      MsgSendPacketResponse.decode(new BinaryReader(data)),
    );
  }
}
