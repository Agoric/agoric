//@ts-nocheck
import * as _87 from './applications/interchain_accounts/controller/v1/controller.js';
import * as _88 from './applications/interchain_accounts/controller/v1/query.js';
import * as _89 from './applications/interchain_accounts/controller/v1/tx.js';
import * as _90 from './applications/interchain_accounts/genesis/v1/genesis.js';
import * as _91 from './applications/interchain_accounts/host/v1/host.js';
import * as _92 from './applications/interchain_accounts/host/v1/query.js';
import * as _93 from './applications/interchain_accounts/v1/account.js';
import * as _94 from './applications/interchain_accounts/v1/metadata.js';
import * as _95 from './applications/interchain_accounts/v1/packet.js';
import * as _96 from './applications/transfer/v1/authz.js';
import * as _97 from './applications/transfer/v1/genesis.js';
import * as _98 from './applications/transfer/v1/query.js';
import * as _99 from './applications/transfer/v1/transfer.js';
import * as _100 from './applications/transfer/v1/tx.js';
import * as _101 from './applications/transfer/v2/packet.js';
import * as _102 from './core/channel/v1/channel.js';
import * as _103 from './core/channel/v1/genesis.js';
import * as _104 from './core/channel/v1/query.js';
import * as _105 from './core/channel/v1/tx.js';
import * as _106 from './core/client/v1/client.js';
import * as _107 from './core/client/v1/genesis.js';
import * as _108 from './core/client/v1/query.js';
import * as _109 from './core/client/v1/tx.js';
import * as _110 from './core/commitment/v1/commitment.js';
import * as _111 from './core/connection/v1/connection.js';
import * as _112 from './core/connection/v1/genesis.js';
import * as _113 from './core/connection/v1/query.js';
import * as _114 from './core/connection/v1/tx.js';
import * as _115 from './lightclients/localhost/v1/localhost.js';
import * as _116 from './lightclients/solomachine/v1/solomachine.js';
import * as _117 from './lightclients/solomachine/v2/solomachine.js';
import * as _118 from './lightclients/tendermint/v1/tendermint.js';
export var ibc;
(function (ibc) {
    let applications;
    (function (applications) {
        let interchain_accounts;
        (function (interchain_accounts) {
            let controller;
            (function (controller) {
                controller.v1 = {
                    ..._87,
                    ..._88,
                    ..._89,
                };
            })(controller = interchain_accounts.controller || (interchain_accounts.controller = {}));
            let genesis;
            (function (genesis) {
                genesis.v1 = {
                    ..._90,
                };
            })(genesis = interchain_accounts.genesis || (interchain_accounts.genesis = {}));
            let host;
            (function (host) {
                host.v1 = {
                    ..._91,
                    ..._92,
                };
            })(host = interchain_accounts.host || (interchain_accounts.host = {}));
            interchain_accounts.v1 = {
                ..._93,
                ..._94,
                ..._95,
            };
        })(interchain_accounts = applications.interchain_accounts || (applications.interchain_accounts = {}));
        let transfer;
        (function (transfer) {
            transfer.v1 = {
                ..._96,
                ..._97,
                ..._98,
                ..._99,
                ..._100,
            };
            transfer.v2 = {
                ..._101,
            };
        })(transfer = applications.transfer || (applications.transfer = {}));
    })(applications = ibc.applications || (ibc.applications = {}));
    let core;
    (function (core) {
        let channel;
        (function (channel) {
            channel.v1 = {
                ..._102,
                ..._103,
                ..._104,
                ..._105,
            };
        })(channel = core.channel || (core.channel = {}));
        let client;
        (function (client) {
            client.v1 = {
                ..._106,
                ..._107,
                ..._108,
                ..._109,
            };
        })(client = core.client || (core.client = {}));
        let commitment;
        (function (commitment) {
            commitment.v1 = {
                ..._110,
            };
        })(commitment = core.commitment || (core.commitment = {}));
        let connection;
        (function (connection) {
            connection.v1 = {
                ..._111,
                ..._112,
                ..._113,
                ..._114,
            };
        })(connection = core.connection || (core.connection = {}));
    })(core = ibc.core || (ibc.core = {}));
    let lightclients;
    (function (lightclients) {
        let localhost;
        (function (localhost) {
            localhost.v1 = {
                ..._115,
            };
        })(localhost = lightclients.localhost || (lightclients.localhost = {}));
        let solomachine;
        (function (solomachine) {
            solomachine.v1 = {
                ..._116,
            };
            solomachine.v2 = {
                ..._117,
            };
        })(solomachine = lightclients.solomachine || (lightclients.solomachine = {}));
        let tendermint;
        (function (tendermint) {
            tendermint.v1 = {
                ..._118,
            };
        })(tendermint = lightclients.tendermint || (lightclients.tendermint = {}));
    })(lightclients = ibc.lightclients || (ibc.lightclients = {}));
})(ibc || (ibc = {}));
//# sourceMappingURL=bundle.js.map