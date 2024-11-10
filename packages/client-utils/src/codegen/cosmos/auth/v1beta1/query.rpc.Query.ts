//@ts-nocheck
import { type Rpc } from '../../../helpers.js';
import { BinaryReader } from '../../../binary.js';
import { QueryClient, createProtobufRpcClient } from '@cosmjs/stargate';
import {
  QueryAccountsRequest,
  QueryAccountsResponse,
  QueryAccountRequest,
  QueryAccountResponse,
  QueryAccountAddressByIDRequest,
  QueryAccountAddressByIDResponse,
  QueryParamsRequest,
  QueryParamsResponse,
  QueryModuleAccountsRequest,
  QueryModuleAccountsResponse,
  QueryModuleAccountByNameRequest,
  QueryModuleAccountByNameResponse,
  Bech32PrefixRequest,
  Bech32PrefixResponse,
  AddressBytesToStringRequest,
  AddressBytesToStringResponse,
  AddressStringToBytesRequest,
  AddressStringToBytesResponse,
} from './query.js';
/** Query defines the gRPC querier service. */
export interface Query {
  /**
   * Accounts returns all the existing accounts
   *
   * Since: cosmos-sdk 0.43
   */
  accounts(request?: QueryAccountsRequest): Promise<QueryAccountsResponse>;
  /** Account returns account details based on address. */
  account(request: QueryAccountRequest): Promise<QueryAccountResponse>;
  /**
   * AccountAddressByID returns account address based on account number.
   *
   * Since: cosmos-sdk 0.46.2
   */
  accountAddressByID(
    request: QueryAccountAddressByIDRequest,
  ): Promise<QueryAccountAddressByIDResponse>;
  /** Params queries all parameters. */
  params(request?: QueryParamsRequest): Promise<QueryParamsResponse>;
  /**
   * ModuleAccounts returns all the existing module accounts.
   *
   * Since: cosmos-sdk 0.46
   */
  moduleAccounts(
    request?: QueryModuleAccountsRequest,
  ): Promise<QueryModuleAccountsResponse>;
  /** ModuleAccountByName returns the module account info by module name */
  moduleAccountByName(
    request: QueryModuleAccountByNameRequest,
  ): Promise<QueryModuleAccountByNameResponse>;
  /**
   * Bech32Prefix queries bech32Prefix
   *
   * Since: cosmos-sdk 0.46
   */
  bech32Prefix(request?: Bech32PrefixRequest): Promise<Bech32PrefixResponse>;
  /**
   * AddressBytesToString converts Account Address bytes to string
   *
   * Since: cosmos-sdk 0.46
   */
  addressBytesToString(
    request: AddressBytesToStringRequest,
  ): Promise<AddressBytesToStringResponse>;
  /**
   * AddressStringToBytes converts Address string to bytes
   *
   * Since: cosmos-sdk 0.46
   */
  addressStringToBytes(
    request: AddressStringToBytesRequest,
  ): Promise<AddressStringToBytesResponse>;
}
export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.accounts = this.accounts.bind(this);
    this.account = this.account.bind(this);
    this.accountAddressByID = this.accountAddressByID.bind(this);
    this.params = this.params.bind(this);
    this.moduleAccounts = this.moduleAccounts.bind(this);
    this.moduleAccountByName = this.moduleAccountByName.bind(this);
    this.bech32Prefix = this.bech32Prefix.bind(this);
    this.addressBytesToString = this.addressBytesToString.bind(this);
    this.addressStringToBytes = this.addressStringToBytes.bind(this);
  }
  accounts(
    request: QueryAccountsRequest = {
      pagination: undefined,
    },
  ): Promise<QueryAccountsResponse> {
    const data = QueryAccountsRequest.encode(request).finish();
    const promise = this.rpc.request(
      'cosmos.auth.v1beta1.Query',
      'Accounts',
      data,
    );
    return promise.then(data =>
      QueryAccountsResponse.decode(new BinaryReader(data)),
    );
  }
  account(request: QueryAccountRequest): Promise<QueryAccountResponse> {
    const data = QueryAccountRequest.encode(request).finish();
    const promise = this.rpc.request(
      'cosmos.auth.v1beta1.Query',
      'Account',
      data,
    );
    return promise.then(data =>
      QueryAccountResponse.decode(new BinaryReader(data)),
    );
  }
  accountAddressByID(
    request: QueryAccountAddressByIDRequest,
  ): Promise<QueryAccountAddressByIDResponse> {
    const data = QueryAccountAddressByIDRequest.encode(request).finish();
    const promise = this.rpc.request(
      'cosmos.auth.v1beta1.Query',
      'AccountAddressByID',
      data,
    );
    return promise.then(data =>
      QueryAccountAddressByIDResponse.decode(new BinaryReader(data)),
    );
  }
  params(request: QueryParamsRequest = {}): Promise<QueryParamsResponse> {
    const data = QueryParamsRequest.encode(request).finish();
    const promise = this.rpc.request(
      'cosmos.auth.v1beta1.Query',
      'Params',
      data,
    );
    return promise.then(data =>
      QueryParamsResponse.decode(new BinaryReader(data)),
    );
  }
  moduleAccounts(
    request: QueryModuleAccountsRequest = {},
  ): Promise<QueryModuleAccountsResponse> {
    const data = QueryModuleAccountsRequest.encode(request).finish();
    const promise = this.rpc.request(
      'cosmos.auth.v1beta1.Query',
      'ModuleAccounts',
      data,
    );
    return promise.then(data =>
      QueryModuleAccountsResponse.decode(new BinaryReader(data)),
    );
  }
  moduleAccountByName(
    request: QueryModuleAccountByNameRequest,
  ): Promise<QueryModuleAccountByNameResponse> {
    const data = QueryModuleAccountByNameRequest.encode(request).finish();
    const promise = this.rpc.request(
      'cosmos.auth.v1beta1.Query',
      'ModuleAccountByName',
      data,
    );
    return promise.then(data =>
      QueryModuleAccountByNameResponse.decode(new BinaryReader(data)),
    );
  }
  bech32Prefix(
    request: Bech32PrefixRequest = {},
  ): Promise<Bech32PrefixResponse> {
    const data = Bech32PrefixRequest.encode(request).finish();
    const promise = this.rpc.request(
      'cosmos.auth.v1beta1.Query',
      'Bech32Prefix',
      data,
    );
    return promise.then(data =>
      Bech32PrefixResponse.decode(new BinaryReader(data)),
    );
  }
  addressBytesToString(
    request: AddressBytesToStringRequest,
  ): Promise<AddressBytesToStringResponse> {
    const data = AddressBytesToStringRequest.encode(request).finish();
    const promise = this.rpc.request(
      'cosmos.auth.v1beta1.Query',
      'AddressBytesToString',
      data,
    );
    return promise.then(data =>
      AddressBytesToStringResponse.decode(new BinaryReader(data)),
    );
  }
  addressStringToBytes(
    request: AddressStringToBytesRequest,
  ): Promise<AddressStringToBytesResponse> {
    const data = AddressStringToBytesRequest.encode(request).finish();
    const promise = this.rpc.request(
      'cosmos.auth.v1beta1.Query',
      'AddressStringToBytes',
      data,
    );
    return promise.then(data =>
      AddressStringToBytesResponse.decode(new BinaryReader(data)),
    );
  }
}
export const createRpcQueryExtension = (base: QueryClient) => {
  const rpc = createProtobufRpcClient(base);
  const queryService = new QueryClientImpl(rpc);
  return {
    accounts(request?: QueryAccountsRequest): Promise<QueryAccountsResponse> {
      return queryService.accounts(request);
    },
    account(request: QueryAccountRequest): Promise<QueryAccountResponse> {
      return queryService.account(request);
    },
    accountAddressByID(
      request: QueryAccountAddressByIDRequest,
    ): Promise<QueryAccountAddressByIDResponse> {
      return queryService.accountAddressByID(request);
    },
    params(request?: QueryParamsRequest): Promise<QueryParamsResponse> {
      return queryService.params(request);
    },
    moduleAccounts(
      request?: QueryModuleAccountsRequest,
    ): Promise<QueryModuleAccountsResponse> {
      return queryService.moduleAccounts(request);
    },
    moduleAccountByName(
      request: QueryModuleAccountByNameRequest,
    ): Promise<QueryModuleAccountByNameResponse> {
      return queryService.moduleAccountByName(request);
    },
    bech32Prefix(request?: Bech32PrefixRequest): Promise<Bech32PrefixResponse> {
      return queryService.bech32Prefix(request);
    },
    addressBytesToString(
      request: AddressBytesToStringRequest,
    ): Promise<AddressBytesToStringResponse> {
      return queryService.addressBytesToString(request);
    },
    addressStringToBytes(
      request: AddressStringToBytesRequest,
    ): Promise<AddressStringToBytesResponse> {
      return queryService.addressStringToBytes(request);
    },
  };
};
