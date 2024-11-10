//@ts-nocheck
import { type Rpc } from '../../../helpers.js';
import { BinaryReader } from '../../../binary.js';
import {
  MsgCreateVestingAccount,
  MsgCreateVestingAccountResponse,
  MsgCreatePermanentLockedAccount,
  MsgCreatePermanentLockedAccountResponse,
  MsgCreatePeriodicVestingAccount,
  MsgCreatePeriodicVestingAccountResponse,
  MsgCreateClawbackVestingAccount,
  MsgCreateClawbackVestingAccountResponse,
  MsgClawback,
  MsgClawbackResponse,
  MsgReturnGrants,
  MsgReturnGrantsResponse,
} from './tx.js';
/** Msg defines the bank Msg service. */
export interface Msg {
  /**
   * CreateVestingAccount defines a method that enables creating a vesting
   * account.
   */
  createVestingAccount(
    request: MsgCreateVestingAccount,
  ): Promise<MsgCreateVestingAccountResponse>;
  /**
   * CreatePermanentLockedAccount defines a method that enables creating a permanent
   * locked account.
   *
   * Since: cosmos-sdk 0.46
   */
  createPermanentLockedAccount(
    request: MsgCreatePermanentLockedAccount,
  ): Promise<MsgCreatePermanentLockedAccountResponse>;
  /**
   * CreatePeriodicVestingAccount defines a method that enables creating a
   * periodic vesting account.
   *
   * Since: cosmos-sdk 0.46
   */
  createPeriodicVestingAccount(
    request: MsgCreatePeriodicVestingAccount,
  ): Promise<MsgCreatePeriodicVestingAccountResponse>;
  /**
   * CreateClawbackVestingAccount defines a method that enables creating a
   * vesting account that is subject to clawback.
   */
  createClawbackVestingAccount(
    request: MsgCreateClawbackVestingAccount,
  ): Promise<MsgCreateClawbackVestingAccountResponse>;
  /** Clawback removes the unvested tokens from a ClawbackVestingAccount. */
  clawback(request: MsgClawback): Promise<MsgClawbackResponse>;
  /** ReturnGrants returns vesting grants to the funder. */
  returnGrants(request: MsgReturnGrants): Promise<MsgReturnGrantsResponse>;
}
export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.createVestingAccount = this.createVestingAccount.bind(this);
    this.createPermanentLockedAccount =
      this.createPermanentLockedAccount.bind(this);
    this.createPeriodicVestingAccount =
      this.createPeriodicVestingAccount.bind(this);
    this.createClawbackVestingAccount =
      this.createClawbackVestingAccount.bind(this);
    this.clawback = this.clawback.bind(this);
    this.returnGrants = this.returnGrants.bind(this);
  }
  createVestingAccount(
    request: MsgCreateVestingAccount,
  ): Promise<MsgCreateVestingAccountResponse> {
    const data = MsgCreateVestingAccount.encode(request).finish();
    const promise = this.rpc.request(
      'cosmos.vesting.v1beta1.Msg',
      'CreateVestingAccount',
      data,
    );
    return promise.then(data =>
      MsgCreateVestingAccountResponse.decode(new BinaryReader(data)),
    );
  }
  createPermanentLockedAccount(
    request: MsgCreatePermanentLockedAccount,
  ): Promise<MsgCreatePermanentLockedAccountResponse> {
    const data = MsgCreatePermanentLockedAccount.encode(request).finish();
    const promise = this.rpc.request(
      'cosmos.vesting.v1beta1.Msg',
      'CreatePermanentLockedAccount',
      data,
    );
    return promise.then(data =>
      MsgCreatePermanentLockedAccountResponse.decode(new BinaryReader(data)),
    );
  }
  createPeriodicVestingAccount(
    request: MsgCreatePeriodicVestingAccount,
  ): Promise<MsgCreatePeriodicVestingAccountResponse> {
    const data = MsgCreatePeriodicVestingAccount.encode(request).finish();
    const promise = this.rpc.request(
      'cosmos.vesting.v1beta1.Msg',
      'CreatePeriodicVestingAccount',
      data,
    );
    return promise.then(data =>
      MsgCreatePeriodicVestingAccountResponse.decode(new BinaryReader(data)),
    );
  }
  createClawbackVestingAccount(
    request: MsgCreateClawbackVestingAccount,
  ): Promise<MsgCreateClawbackVestingAccountResponse> {
    const data = MsgCreateClawbackVestingAccount.encode(request).finish();
    const promise = this.rpc.request(
      'cosmos.vesting.v1beta1.Msg',
      'CreateClawbackVestingAccount',
      data,
    );
    return promise.then(data =>
      MsgCreateClawbackVestingAccountResponse.decode(new BinaryReader(data)),
    );
  }
  clawback(request: MsgClawback): Promise<MsgClawbackResponse> {
    const data = MsgClawback.encode(request).finish();
    const promise = this.rpc.request(
      'cosmos.vesting.v1beta1.Msg',
      'Clawback',
      data,
    );
    return promise.then(data =>
      MsgClawbackResponse.decode(new BinaryReader(data)),
    );
  }
  returnGrants(request: MsgReturnGrants): Promise<MsgReturnGrantsResponse> {
    const data = MsgReturnGrants.encode(request).finish();
    const promise = this.rpc.request(
      'cosmos.vesting.v1beta1.Msg',
      'ReturnGrants',
      data,
    );
    return promise.then(data =>
      MsgReturnGrantsResponse.decode(new BinaryReader(data)),
    );
  }
}
