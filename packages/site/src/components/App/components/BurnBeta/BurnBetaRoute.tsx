import { Button, Flex, Text } from "@chakra-ui/react";
import { BN, Provider } from "@project-serum/anchor";
import { Token } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  Notification,
  TokenAccount,
  useErrorHandler,
  useProvider,
  useWalletTokenAccounts,
} from "@strata-foundation/react";
import React from "react";
import { useAsync, useAsyncCallback } from "react-async-hook";
import toast from "react-hot-toast";
import { Spinner, truthy } from "wumbo-common";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import WalletRedirect from "../Wallet/WalletRedirect";

async function getBurnable(
  connection: Connection,
  accounts?: TokenAccount[]
): Promise<TokenAccount[]> {
  if (!accounts) {
    return [];
  }

  return (
    await Promise.all(
      accounts.map(async (account) => {
        const pad = Buffer.alloc(2);
        new BN(0, 16, "le").toBuffer().copy(pad);
        const oldBondingAddress = await PublicKey.findProgramAddress(
          [Buffer.from("token-bonding"), account.info.mint.toBuffer(), pad],
          new PublicKey("TBondz6ZwSM5fs4v2GpnVBMuwoncPkFLFR9S422ghhN")
        );

        // Exclude net bwum, which also still has a bonding curve from the old contract
        if (await connection.getAccountInfo(oldBondingAddress[0]) && account.info.mint.toBase58() != "HvdnoodTaRSaB7AEtm7QaDveqW9M3r4hmoNaqTggQkVp") {
          return account;
        }

        return null;
      })
    )
  ).filter(truthy);
}

function chunkArray<A>(array: A[], chunkSize: number): A[][] {
  const numberOfChunks = Math.ceil(array.length / chunkSize);

  return [...Array(numberOfChunks)].map((value, index) => {
    return array.slice(index * chunkSize, (index + 1) * chunkSize);
  });
}

async function burn(
  provider: Provider,
  tokenAccounts?: TokenAccount[]
): Promise<void> {
  const publicKey = provider.wallet.publicKey;
  if (!tokenAccounts) {
    return;
  }

  const recentBlockhash = (await provider.connection.getRecentBlockhash())
    .blockhash;

  const closeInstrs: TransactionInstruction[][] = tokenAccounts.map(
    (account) => {
      return [
        Token.createBurnInstruction(
          TOKEN_PROGRAM_ID,
          account.info.mint,
          account.pubkey,
          account.info.owner,
          [],
          account.info.amount
        ),
        Token.createCloseAccountInstruction(
          TOKEN_PROGRAM_ID,
          account.pubkey,
          publicKey,
          publicKey,
          []
        ),
      ];
    }
  );
  const txs = await chunkArray(closeInstrs, 10)
    .map((group) => group.flat())
    .map((instructions) => {
      const tx = new Transaction({
        feePayer: publicKey,
        recentBlockhash,
      });
      tx.instructions.push(...instructions);

      return tx;
    });
  await provider.sendAll(
    txs.map((tx) => ({
      signers: [],
      tx,
    }))
  );
}
export const BurnBetaRoute: React.FC = () => {
  const { publicKey } = useWallet();
  const {
    loading: loadingAccounts,
    result,
    error,
  } = useWalletTokenAccounts(publicKey || undefined);
  const { connection } = useConnection();
  const {
    result: burnableAccounts,
    loading: loadingBurnable,
    error: burnableError,
  } = useAsync(getBurnable, [connection, result]);
  const { handleErrors } = useErrorHandler();
  const { provider, awaitingApproval } = useProvider();
  const { error: burnError, loading: burning } = useAsyncCallback(burn);
  handleErrors(error, burnableError, burnError);

  if (loadingAccounts || loadingBurnable) {
    return <Spinner />;
  }

  const totalLamports = burnableAccounts?.reduce(
    (acc, burn) => acc + burn.account.lamports,
    0
  );
  const totalSol = (totalLamports || 0) / Math.pow(10, 9);

  return (
    <Flex
      direction="column"
      align="center"
      w="full"
      maxW={{ md: "760px" }}
      m="0 auto"
      p={10}
    >
      <WalletRedirect />
      <Text>
        You have {totalSol} SOL reclaimable in rent from{" "}
        {burnableAccounts?.length} wumbo beta accounts
      </Text>
      <Button
        colorScheme="red"
        disabled={burning || awaitingApproval}
        loading={burning || awaitingApproval}
        onClick={() =>
          burn(provider!, burnableAccounts).then(() => {
            toast.custom((t) => (
              <Notification
                show={t.visible}
                type="success"
                heading="Burn Successful"
                message={`Closed ${burnableAccounts?.length} accounts to free ${totalSol} SOL`}
                onDismiss={() => toast.dismiss(t.id)}
              />
            ));
          })
        }
      >
        {awaitingApproval ? "Awaiting Approval" : "BURN!"}
      </Button>
    </Flex>
  );
};
