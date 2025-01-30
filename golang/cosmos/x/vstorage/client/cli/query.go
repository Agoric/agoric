package cli

import (
	"github.com/Agoric/agoric-sdk/golang/cosmos/x/vstorage/types"
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/gogoproto/proto"
	"github.com/spf13/cobra"
)

func GetQueryCmd(storeKey string) *cobra.Command {
	swingsetQueryCmd := &cobra.Command{
		Use:                        types.ModuleName,
		Short:                      "Querying commands for the vstorage module",
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}
	swingsetQueryCmd.AddCommand(
		GetCmdGetData(storeKey),
		GetCmdGetChildren(storeKey),
		GetCmdGetPath(storeKey),
	)

	return swingsetQueryCmd
}

// GetCmdGetData queries information about storage
func GetCmdGetData(queryRoute string) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "data <path>",
		Short: "get data for vstorage path",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientQueryContext(cmd)
			if err != nil {
				return err
			}
			queryClient := types.NewQueryClient(clientCtx)

			path := args[0]

			res, err := queryClient.Data(cmd.Context(), &types.QueryDataRequest{
				Path: path,
			})
			if err != nil {
				return err
			}

			return clientCtx.PrintProto(res)
		},
	}

	flags.AddQueryFlagsToCmd(cmd)
	return cmd
}

// GetCmdGetChildren queries vstorage children
func GetCmdGetChildren(queryRoute string) *cobra.Command {
	cmd := &cobra.Command{
		Use:     "children [path]",
		Aliases: []string{"keys"},
		Short:   "get child path segments under vstorage path",
		Long: `get child path segments under vstorage path.
When absent, path defaults to the empty root path.
Path segments are dot-separated, so a child "baz" under path "foo.bar" has path
"foo.bar.baz".`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientQueryContext(cmd)
			if err != nil {
				return err
			}
			queryClient := types.NewQueryClient(clientCtx)

			path := ""
			if len(args) > 0 {
				path = args[0]
			}

			res, err := queryClient.Children(cmd.Context(), &types.QueryChildrenRequest{
				Path: path,
			})
			if err != nil {
				return err
			}

			return clientCtx.PrintProto(res)
		},
	}

	flags.AddQueryFlagsToCmd(cmd)
	return cmd
}

// GetCmdGetPath queries vstorage data or children, depending on the path
func GetCmdGetPath(queryRoute string) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "path <path>",
		Short: "get vstorage data, or children if path ends with '.'",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientQueryContext(cmd)
			if err != nil {
				return err
			}
			queryClient := types.NewQueryClient(clientCtx)

			path := args[0]

			var res proto.Message

			// if path ends with '.' then remove it and query children
			if path[len(path)-1] == '.' {
				path = path[:len(path)-1]
				res, err = queryClient.Children(cmd.Context(), &types.QueryChildrenRequest{
					Path: path,
				})
			} else {
				res, err = queryClient.Data(cmd.Context(), &types.QueryDataRequest{
					Path: path,
				})
			}

			if err != nil {
				return err
			}

			return clientCtx.PrintProto(res)
		},
	}

	flags.AddQueryFlagsToCmd(cmd)
	return cmd
}
