/**
 * @callback MakeInstallSaveAndPublish
 * @param {BundleSource} bundleSource
 * @param {ERef<ZoeService>} zoe
 * @param {ERef<InstallationManager>} installationManager
 * @param {ERef<Board>} board
 * @returns {InstallSaveAndPublish}
 */

// TODO: import this from agoric-cli

/**
 * @callback MakeOfferAndFindInvitationAmount
 * @param {ERef<WalletAdminFacet>} walletAdmin - An internal type of the wallet,
 *   not defined here
 * @param {ERef<ZoeService>} zoe
 * @param {ERef<Purse>} zoeInvitationPurse
 * @returns {{
 *   offer: OfferHelper;
 *   findInvitationAmount: FindInvitationAmount;
 * }}
 */

/**
 * @callback MakeSaveIssuerHelper
 * @param {ERef<WalletAdminFacet>} walletAdmin - An internal type of the wallet,
 *   not defined here
 * @param {ERef<IssuerManager>} issuerManager
 * @returns {SaveIssuerHelper}
 */

/**
 * @callback MakeDepositInvitation
 * @param {ERef<Purse>} zoeInvitationPurse
 * @returns {DepositInvitation}
 */
