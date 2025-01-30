package cli

import (
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/pkg/errors"
	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/tx"
	govcli "github.com/cosmos/cosmos-sdk/x/gov/client/cli"
	govv1beta1 "github.com/cosmos/cosmos-sdk/x/gov/types/v1beta1"

	"github.com/Agoric/agoric-sdk/golang/cosmos/x/swingset/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

const (
	FlagAllowSpend = "allow-spend"
	FlagCompress   = "compress"
)

func GetTxCmd(storeKey string) *cobra.Command {
	swingsetTxCmd := &cobra.Command{
		Use:                        types.ModuleName,
		Short:                      "SwingSet transaction subcommands",
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}

	swingsetTxCmd.AddCommand(
		GetCmdDeliver(),
		GetCmdProvisionOne(),
		GetCmdInstallBundle(),
		GetCmdWalletAction(),
	)

	return swingsetTxCmd
}

// GetCmdDeliver is the CLI command for sending a DeliverInbound transaction
// containing mailbox messages.
func GetCmdDeliver() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "deliver {<messages JSON> | @- | @<file>}",
		Short: "send mailbox messages",
		Long: `send mailbox messages.
The argument indicates how to read input JSON ("@-" for standard input,
"@..." for a file path, and otherwise directly as in "deliver '[...]'").
Input must represent an array in which the first element is an array of
[messageNum: integer, messageBody: string] pairs and the second element
is an "Ack" integer.`,
		Args: cobra.ExactArgs(1),

		RunE: func(cmd *cobra.Command, args []string) error {
			cctx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			jsonIn := args[0]
			if strings.HasPrefix(jsonIn, "@") {
				var jsonBytes []byte
				fname := jsonIn[1:]
				if fname == "-" {
					jsonBytes, err = io.ReadAll(os.Stdin)
				} else {
					jsonBytes, err = os.ReadFile(fname)
				}
				if err != nil {
					return err
				}
				jsonIn = string(jsonBytes)
			}
			msgs, err := types.UnmarshalMessagesJSON(jsonIn)
			if err != nil {
				return err
			}

			msg := types.NewMsgDeliverInbound(msgs, cctx.GetFromAddress())
			if err := msg.ValidateBasic(); err != nil {
				return err
			}

			return tx.GenerateOrBroadcastTxCLI(cctx, cmd.Flags(), msg)
		},
	}
	flags.AddTxFlagsToCmd(cmd)
	return cmd
}

// GetCmdInstallBundle is the CLI command for constructing or sending an
// InstallBundle message in a transaction.
func GetCmdInstallBundle() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "install-bundle {<bundle JSON> | @- | @<file>}",
		Short: "install a bundle",
		Long: `install a bundle.
The argument indicates how to read input JSON ("@-" for standard input,
"@..." for a file path, and otherwise directly as in
"install-bundle '{...}'").
Input should be endoZipBase64 JSON, but this is not verified.
https://github.com/endojs/endo/tree/master/packages/bundle-source`,
		Args: cobra.ExactArgs(1),

		RunE: func(cmd *cobra.Command, args []string) error {
			cctx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			jsonIn := args[0]
			if strings.HasPrefix(jsonIn, "@") {
				var jsonBytes []byte
				fname := jsonIn[1:]
				if fname == "-" {
					jsonBytes, err = io.ReadAll(os.Stdin)
				} else {
					jsonBytes, err = os.ReadFile(fname)
				}
				if err != nil {
					return err
				}
				jsonIn = string(jsonBytes)
			}

			msg := types.NewMsgInstallBundle(jsonIn, cctx.GetFromAddress())
			if err := msg.ValidateBasic(); err != nil {
				return err
			}

			compress, err := cmd.Flags().GetBool(FlagCompress)
			if err != nil {
				return err
			}
			if compress {
				err = msg.Compress()
				if err != nil {
					return err
				}
				// re-validate to be sure
				err = msg.ValidateBasic()
				if err != nil {
					return err
				}
			}

			return tx.GenerateOrBroadcastTxCLI(cctx, cmd.Flags(), msg)
		},
	}
	cmd.Flags().Bool(FlagCompress, true, "Compress the bundle in transit")
	flags.AddTxFlagsToCmd(cmd)
	return cmd
}

// GetCmdProvision is the CLI command for sending a Provision transaction
func GetCmdProvisionOne() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "provision-one <nickname> <address> [<power-flag>[,...]]",
		Short: "provision a single address",
		Args:  cobra.RangeArgs(2, 3),

		RunE: func(cmd *cobra.Command, args []string) error {
			cctx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			nickname := args[0]

			addr, err := sdk.AccAddressFromBech32(args[1])
			if err != nil {
				return err
			}

			var powerFlags []string
			if len(args) > 2 {
				powerFlags = strings.Split(args[2], ",")
			}

			msg := types.NewMsgProvision(nickname, addr, powerFlags, cctx.GetFromAddress())
			if err := msg.ValidateBasic(); err != nil {
				return err
			}

			return tx.GenerateOrBroadcastTxCLI(cctx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)
	return cmd
}

type HasValidateBasic interface {
	ValidateBasic() error
}

// GetCmdWalletAction is the CLI command for sending a WalletAction or WalletSpendAction transaction
func GetCmdWalletAction() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "wallet-action <action JSON>",
		Short: "perform a wallet action",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			owner := clientCtx.GetFromAddress()
			action := args[0]

			spend, err := cmd.Flags().GetBool(FlagAllowSpend)
			if err != nil {
				return err
			}

			var msg sdk.Msg
			if spend {
				msg = types.NewMsgWalletSpendAction(owner, action)
			} else {
				msg = types.NewMsgWalletAction(owner, action)
			}
			err = msg.(HasValidateBasic).ValidateBasic()
			if err != nil {
				return err
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	cmd.Flags().Bool(FlagAllowSpend, false, "Allow the WalletAction to spend assets")
	flags.AddTxFlagsToCmd(cmd)
	return cmd
}

// NewCmdSubmitCoreEvalProposal is the CLI command for submitting a "CoreEval"
// governance proposal via `agd tx gov submit-proposal swingset-core-eval ...`.
func NewCmdSubmitCoreEvalProposal() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "swingset-core-eval <permit.json code.js>...",
		Args:  cobra.MinimumNArgs(2),
		Short: "Submit a proposal to evaluate code in the SwingSet core",
		Long: `Submit a SwingSet evaluate core Compartment code proposal along with an initial deposit.
Specify at least one pair of permit.json and code.js files`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if len(args)%2 != 0 {
				return fmt.Errorf("must specify paired permit.json and code.js files")
			}

			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			//nolint:staticcheck // Agoric is still using the legacy proposal shape
			title, err := cmd.Flags().GetString(govcli.FlagTitle)
			if err != nil {
				return err
			}

			//nolint:staticcheck // Agoric is still using the legacy proposal shape
			description, err := cmd.Flags().GetString(govcli.FlagDescription)
			if err != nil {
				return err
			}

			npairs := len(args) / 2
			evals := make([]types.CoreEval, 0, npairs)
			for j := 0; j < npairs; j++ {
				permitFile := args[j*2]
				permit, err := os.ReadFile(permitFile)
				if err != nil {
					return errors.Wrapf(err, "failed to read permit %s", permitFile)
				}

				codeFile := args[j*2+1]
				code, err := os.ReadFile(codeFile)
				if err != nil {
					return errors.Wrapf(err, "failed to read code %s", codeFile)
				}

				ce := types.CoreEval{
					JsonPermits: string(permit),
					JsCode:      string(code),
				}
				if err = ce.ValidateBasic(); err != nil {
					return errors.Wrapf(err, "cannot validate permit=%s, code=%s", permitFile, codeFile)
				}

				evals = append(evals, ce)
			}

			from := clientCtx.GetFromAddress()
			content := types.NewCoreEvalProposal(title, description, evals)

			depositStr, err := cmd.Flags().GetString(govcli.FlagDeposit)
			if err != nil {
				return err
			}

			deposit, err := sdk.ParseCoinsNormalized(depositStr)
			if err != nil {
				return err
			}

			msg, err := govv1beta1.NewMsgSubmitProposal(content, deposit, from)
			if err != nil {
				return err
			}

			// TODO-ICU: temporarily comment validateBasic call
			// if err = msg.ValidateBasic(); err != nil {
			// 	return err
			// }

			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	//nolint:staticcheck // Agoric is still using the legacy proposal shape
	cmd.Flags().String(govcli.FlagTitle, "", "title of proposal")
	//nolint:staticcheck // Agoric is still using the legacy proposal shape
	cmd.Flags().String(govcli.FlagDescription, "", "description of proposal")
	cmd.Flags().String(govcli.FlagDeposit, "", "deposit for proposal")

	return cmd
}
