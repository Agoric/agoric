//@ts-nocheck
import { type Rpc } from '../../helpers.js';
import { BinaryReader } from '../../binary.js';
import {
  MsgInstallBundle,
  MsgInstallBundleResponse,
  MsgDeliverInbound,
  MsgDeliverInboundResponse,
  MsgWalletAction,
  MsgWalletActionResponse,
  MsgWalletSpendAction,
  MsgWalletSpendActionResponse,
  MsgProvision,
  MsgProvisionResponse,
} from './msgs.js';
/** Transactions. */
export interface Msg {
  /** Install a JavaScript sources bundle on the chain's SwingSet controller. */
  installBundle(request: MsgInstallBundle): Promise<MsgInstallBundleResponse>;
  /** Send inbound messages. */
  deliverInbound(
    request: MsgDeliverInbound,
  ): Promise<MsgDeliverInboundResponse>;
  /** Perform a low-privilege wallet action. */
  walletAction(request: MsgWalletAction): Promise<MsgWalletActionResponse>;
  /** Perform a wallet action that spends assets. */
  walletSpendAction(
    request: MsgWalletSpendAction,
  ): Promise<MsgWalletSpendActionResponse>;
  /** Provision a new endpoint. */
  provision(request: MsgProvision): Promise<MsgProvisionResponse>;
}
export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.installBundle = this.installBundle.bind(this);
    this.deliverInbound = this.deliverInbound.bind(this);
    this.walletAction = this.walletAction.bind(this);
    this.walletSpendAction = this.walletSpendAction.bind(this);
    this.provision = this.provision.bind(this);
  }
  installBundle(request: MsgInstallBundle): Promise<MsgInstallBundleResponse> {
    const data = MsgInstallBundle.encode(request).finish();
    const promise = this.rpc.request(
      'agoric.swingset.Msg',
      'InstallBundle',
      data,
    );
    return promise.then(data =>
      MsgInstallBundleResponse.decode(new BinaryReader(data)),
    );
  }
  deliverInbound(
    request: MsgDeliverInbound,
  ): Promise<MsgDeliverInboundResponse> {
    const data = MsgDeliverInbound.encode(request).finish();
    const promise = this.rpc.request(
      'agoric.swingset.Msg',
      'DeliverInbound',
      data,
    );
    return promise.then(data =>
      MsgDeliverInboundResponse.decode(new BinaryReader(data)),
    );
  }
  walletAction(request: MsgWalletAction): Promise<MsgWalletActionResponse> {
    const data = MsgWalletAction.encode(request).finish();
    const promise = this.rpc.request(
      'agoric.swingset.Msg',
      'WalletAction',
      data,
    );
    return promise.then(data =>
      MsgWalletActionResponse.decode(new BinaryReader(data)),
    );
  }
  walletSpendAction(
    request: MsgWalletSpendAction,
  ): Promise<MsgWalletSpendActionResponse> {
    const data = MsgWalletSpendAction.encode(request).finish();
    const promise = this.rpc.request(
      'agoric.swingset.Msg',
      'WalletSpendAction',
      data,
    );
    return promise.then(data =>
      MsgWalletSpendActionResponse.decode(new BinaryReader(data)),
    );
  }
  provision(request: MsgProvision): Promise<MsgProvisionResponse> {
    const data = MsgProvision.encode(request).finish();
    const promise = this.rpc.request('agoric.swingset.Msg', 'Provision', data);
    return promise.then(data =>
      MsgProvisionResponse.decode(new BinaryReader(data)),
    );
  }
}
