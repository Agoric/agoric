//@ts-nocheck
import { type Rpc } from '../../../../../helpers.js';
import { BinaryReader } from '../../../../../binary.js';
import {
  MsgRegisterInterchainAccount,
  MsgRegisterInterchainAccountResponse,
  MsgSendTx,
  MsgSendTxResponse,
} from './tx.js';
/** Msg defines the 27-interchain-accounts/controller Msg service. */
export interface Msg {
  /** RegisterInterchainAccount defines a rpc handler for MsgRegisterInterchainAccount. */
  registerInterchainAccount(
    request: MsgRegisterInterchainAccount,
  ): Promise<MsgRegisterInterchainAccountResponse>;
  /** SendTx defines a rpc handler for MsgSendTx. */
  sendTx(request: MsgSendTx): Promise<MsgSendTxResponse>;
}
export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.registerInterchainAccount = this.registerInterchainAccount.bind(this);
    this.sendTx = this.sendTx.bind(this);
  }
  registerInterchainAccount(
    request: MsgRegisterInterchainAccount,
  ): Promise<MsgRegisterInterchainAccountResponse> {
    const data = MsgRegisterInterchainAccount.encode(request).finish();
    const promise = this.rpc.request(
      'ibc.applications.interchain_accounts.controller.v1.Msg',
      'RegisterInterchainAccount',
      data,
    );
    return promise.then(data =>
      MsgRegisterInterchainAccountResponse.decode(new BinaryReader(data)),
    );
  }
  sendTx(request: MsgSendTx): Promise<MsgSendTxResponse> {
    const data = MsgSendTx.encode(request).finish();
    const promise = this.rpc.request(
      'ibc.applications.interchain_accounts.controller.v1.Msg',
      'SendTx',
      data,
    );
    return promise.then(data =>
      MsgSendTxResponse.decode(new BinaryReader(data)),
    );
  }
}
