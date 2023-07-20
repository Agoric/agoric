/**
 * @file to regenerate
 *   1. set RECORDING=true in test-auction.js
 *   2. run: yarn test test/test-auction.js --update-snapshots
 *   3. copy the map from test-auction.js.md below
 *   4. replace all occurences of : with :
 *   5. change RECORDING back to false
 */
export const listBidsRPC = new Map(
  Object.entries({
    '["http://0.0.0.0:26657",{"method":"POST","body":"[{\\"jsonrpc\\":\\"2.0\\",\\"id\\":1304155529,\\"method\\":\\"abci_query\\",\\"params\\":{\\"path\\":\\"/custom/vstorage/data/published.agoricNames.brand\\"}},{\\"jsonrpc\\":\\"2.0\\",\\"id\\":1,\\"method\\":\\"abci_query\\",\\"params\\":{\\"path\\":\\"/custom/vstorage/data/published.agoricNames.instance\\"}},{\\"jsonrpc\\":\\"2.0\\",\\"id\\":2,\\"method\\":\\"abci_query\\",\\"params\\":{\\"path\\":\\"/custom/vstorage/data/published.agoricNames.vbankAsset\\"}}]"}]':
      [
        {
          id: 0,
          jsonrpc: '2.0',
          result: {
            response: {
              code: 0,
              codespace: '',
              height: '7424',
              index: '0',
              info: '',
              key: null,
              log: '',
              proofOps: null,
              valueBlockHeight: '17',
              valueCapData: {
                body: '#[["AUSD","$0.Alleged: AUSD brand"],["BLD","$1.Alleged: BLD brand"],["IST","$2.Alleged: IST brand"],["Invitation","$3.Alleged: Zoe Invitation brand"],["USDC_axl","$4.Alleged: USDC_axl brand"],["USDC_grv","$5.Alleged: USDC_grv brand"],["USDT_axl","$6.Alleged: USDT_axl brand"],["USDT_grv","$7.Alleged: USDT_grv brand"],["timer","$8.Alleged: timerBrand"],["ATOM","$9.Alleged: ATOM brand"]]',
                slots: [
                  'board04542',
                  'board0566',
                  'board0257',
                  'board0074',
                  'board01034',
                  'board05736',
                  'board03138',
                  'board03040',
                  'board0425',
                  'board02152',
                ],
              },
            },
          },
        },
        {
          id: 1,
          jsonrpc: '2.0',
          result: {
            response: {
              code: 0,
              codespace: '',
              height: '7424',
              index: '0',
              info: '',
              key: null,
              log: '',
              proofOps: null,
              valueBlockHeight: '17',
              valueCapData: {
                body: '#[["ATOM-USD price feed","$0.Alleged: InstanceHandle"],["VaultFactory","$1.Alleged: InstanceHandle"],["VaultFactoryGovernor","$2.Alleged: InstanceHandle"],["auctioneer","$3.Alleged: InstanceHandle"],["econCommitteeCharter","$4.Alleged: InstanceHandle"],["economicCommittee","$5.Alleged: InstanceHandle"],["feeDistributor","$6.Alleged: InstanceHandle"],["provisionPool","$7.Alleged: InstanceHandle"],["psm-IST-AUSD","$8.Alleged: InstanceHandle"],["psm-IST-USDC_axl","$9.Alleged: InstanceHandle"],["psm-IST-USDC_grv","$10.Alleged: InstanceHandle"],["psm-IST-USDT_axl","$11.Alleged: InstanceHandle"],["psm-IST-USDT_grv","$12.Alleged: InstanceHandle"],["reserve","$13.Alleged: InstanceHandle"],["reserveGovernor","$14.Alleged: InstanceHandle"],["walletFactory","$15.Alleged: InstanceHandle"]]',
                slots: [
                  'board06458',
                  'board00855',
                  'board01867',
                  'board04154',
                  'board02656',
                  'board06445',
                  'board05557',
                  'board01759',
                  'board06366',
                  'board05262',
                  'board02963',
                  'board01664',
                  'board03365',
                  'board06053',
                  'board00360',
                  'board04661',
                ],
              },
            },
          },
        },
        {
          id: 2,
          jsonrpc: '2.0',
          result: {
            response: {
              code: 0,
              codespace: '',
              height: '7424',
              index: '0',
              info: '',
              key: null,
              log: '',
              proofOps: null,
              valueBlockHeight: '17',
              valueCapData: {
                body: '#[["ibc/toyatom",{"brand":"$0.Alleged: ATOM brand","denom":"ibc/toyatom","displayInfo":{"assetKind":"nat","decimalPlaces":6},"issuer":"$1.Alleged: ATOM issuer","issuerName":"ATOM","proposedName":"ATOM"}],["ibc/toyellie",{"brand":"$2.Alleged: AUSD brand","denom":"ibc/toyellie","displayInfo":{"assetKind":"nat","decimalPlaces":6},"issuer":"$3.Alleged: AUSD issuer","issuerName":"AUSD","proposedName":"Anchor USD"}],["ibc/toyollie",{"brand":"$4.Alleged: USDT_grv brand","denom":"ibc/toyollie","displayInfo":{"assetKind":"nat","decimalPlaces":6},"issuer":"$5.Alleged: USDT_grv issuer","issuerName":"USDT_grv","proposedName":"Tether USD"}],["ibc/toyusdc",{"brand":"$6.Alleged: USDC_axl brand","denom":"ibc/toyusdc","displayInfo":{"assetKind":"nat","decimalPlaces":6},"issuer":"$7.Alleged: USDC_axl issuer","issuerName":"USDC_axl","proposedName":"USD Coin"}],["ibc/usdc5678",{"brand":"$8.Alleged: USDC_grv brand","denom":"ibc/usdc5678","displayInfo":{"assetKind":"nat","decimalPlaces":6},"issuer":"$9.Alleged: USDC_grv issuer","issuerName":"USDC_grv","proposedName":"USC Coin"}],["ibc/usdt1234",{"brand":"$10.Alleged: USDT_axl brand","denom":"ibc/usdt1234","displayInfo":{"assetKind":"nat","decimalPlaces":6},"issuer":"$11.Alleged: USDT_axl issuer","issuerName":"USDT_axl","proposedName":"Tether USD"}],["ubld",{"brand":"$12.Alleged: BLD brand","denom":"ubld","displayInfo":{"assetKind":"nat","decimalPlaces":6},"issuer":"$13.Alleged: BLD issuer","issuerName":"BLD","proposedName":"Agoric staking token"}],["uist",{"brand":"$14.Alleged: IST brand","denom":"uist","displayInfo":{"assetKind":"nat","decimalPlaces":6},"issuer":"$15.Alleged: IST issuer","issuerName":"IST","proposedName":"Agoric stable token"}]]',
                slots: [
                  'board02152',
                  'board01151',
                  'board04542',
                  'board00443',
                  'board03040',
                  'board05141',
                  'board01034',
                  'board03935',
                  'board05736',
                  'board02437',
                  'board03138',
                  'board05039',
                  'board0566',
                  'board0592',
                  'board0257',
                  'board0223',
                ],
              },
            },
          },
        },
      ],
    '["http://0.0.0.0:26657",{"method":"POST","body":"{\\"jsonrpc\\":\\"2.0\\",\\"id\\":33293090,\\"method\\":\\"abci_query\\",\\"params\\":{\\"path\\":\\"/agoric.vstorage.Query/Children\\",\\"data\\":\\"0a207075626c69736865642e61756374696f6e2e626f6f6b302e7363686564756c65\\",\\"prove\\":false}}","headers":{"Content-Type":"application/json"}}]':
      {
        id: 575919277171,
        jsonrpc: '2.0',
        result: {
          response: {
            code: 0,
            codespace: '',
            height: '7424',
            index: '0',
            info: '',
            key: null,
            log: '',
            proofOps: null,
            value: 'CgdiaWQxMDAxCgdiaWQxMDAyCgdiaWQxMDAz',
          },
        },
      },
    '["http://0.0.0.0:26657",{"method":"POST","body":"[{\\"jsonrpc\\":\\"2.0\\",\\"id\\":1358144711,\\"method\\":\\"abci_query\\",\\"params\\":{\\"path\\":\\"/custom/vstorage/data/published.auction.book0.schedule.bid1001\\"}},{\\"jsonrpc\\":\\"2.0\\",\\"id\\":1,\\"method\\":\\"abci_query\\",\\"params\\":{\\"path\\":\\"/custom/vstorage/data/published.auction.book0.schedule.bid1002\\"}},{\\"jsonrpc\\":\\"2.0\\",\\"id\\":2,\\"method\\":\\"abci_query\\",\\"params\\":{\\"path\\":\\"/custom/vstorage/data/published.auction.book0.schedule.bid1003\\"}}]"}]':
      [
        {
          id: 0,
          jsonrpc: '2.0',
          result: {
            response: {
              code: 0,
              codespace: '',
              height: '7424',
              index: '0',
              info: '',
              key: null,
              log: '',
              proofOps: null,
              valueBlockHeight: '7414',
              valueCapData: {
                body: '#{"balance":{"brand":"$0.Alleged: IST brand","value":"+500000000"},"exitAfterBuy":false,"price":{"denominator":{"brand":"$1.Alleged: ATOM brand","value":"+10"},"numerator":{"brand":"$0","value":"+95"}},"sequence":"+1001","timestamp":{"absValue":"+1689097758","timerBrand":"$2.Alleged: timerBrand"},"wanted":{"brand":"$1","value":"+1000000000000"}}',
                slots: ['board0257', 'board02152', 'board0425'],
              },
            },
          },
        },
        {
          id: 1,
          jsonrpc: '2.0',
          result: {
            response: {
              code: 0,
              codespace: '',
              height: '7424',
              index: '0',
              info: '',
              key: null,
              log: '',
              proofOps: null,
              valueBlockHeight: '7414',
              valueCapData: {
                body: '#{"balance":{"brand":"$0.Alleged: IST brand","value":"+300000000"},"exitAfterBuy":false,"price":{"denominator":{"brand":"$1.Alleged: ATOM brand","value":"+10"},"numerator":{"brand":"$0","value":"+85"}},"sequence":"+1002","timestamp":{"absValue":"+1689119404","timerBrand":"$2.Alleged: timerBrand"},"wanted":{"brand":"$1","value":"+1000000000000"}}',
                slots: ['board0257', 'board02152', 'board0425'],
              },
            },
          },
        },
        {
          id: 2,
          jsonrpc: '2.0',
          result: {
            response: {
              code: 0,
              codespace: '',
              height: '7424',
              index: '0',
              info: '',
              key: null,
              log: '',
              proofOps: null,
              valueBlockHeight: '7414',
              valueCapData: {
                body: '#{"balance":{"brand":"$0.Alleged: IST brand","value":"+200000000"},"bidScaling":{"denominator":{"brand":"$0","value":"+100"},"numerator":{"brand":"$0","value":"+90"}},"exitAfterBuy":false,"sequence":"+1003","timestamp":{"absValue":"+1689134368","timerBrand":"$1.Alleged: timerBrand"},"wanted":{"brand":"$2.Alleged: ATOM brand","value":"+1000000000000"}}',
                slots: ['board0257', 'board0425', 'board02152'],
              },
            },
          },
        },
      ],
  }),
);
