import { Button, FormControl, FormLabel, Heading, Input, VStack, Text, Box } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { Notification, useErrorHandler, useProvider, useStrataSdks } from "@strata-foundation/react";
import { SplTokenCollective } from "@strata-foundation/spl-token-collective";
import React, { useEffect, useState } from "react";
import { Provider } from "@project-serum/anchor";
import { useAsync, useAsyncCallback } from "react-async-hook";
import { WUMBO_IDENTITY_SERVICE_URL } from "./constants";
import { WalletSelect } from "./Pages/WalletSelect";
import { executeRemoteTxn, executeTxnsInOrder, getAndSignRemoteTxns, signOnlyNeeded } from "./utils";
import toast from "react-hot-toast";

type Selecting = "prev" | "new" | "final";
async function relinkSubmit(tokenCollectiveSdk?: SplTokenCollective, provider?: Provider, txns?: Buffer[]): Promise<void> {
  if (tokenCollectiveSdk && provider && txns) {
    await executeTxnsInOrder(
      provider!,
      await signOnlyNeeded(provider, txns!),
      tokenCollectiveSdk!.errors
    )
    toast.custom((t) => (
      <Notification
        show={t.visible}
        type="success"
        heading="Transaction Successful"
        message={"Successfully changed wallet"}
        onDismiss={() => toast.dismiss(t.id)}
      />
    ));
  }
}
export function Relink() {
  const { publicKey, connected, disconnect } = useWallet();
  const [prevWallet, setPrevWallet] = useState<PublicKey>();
  const { awaitingApproval, provider } = useProvider();
  const [newWallet, setNewWallet] = useState<PublicKey>();
  const [selecting, setSelecting] = useState<Selecting>("new");
  const { tokenCollectiveSdk } = useStrataSdks();
  const [txns, setTxns] = useState<Buffer[]>();
  async function relinkTxns(): Promise<Buffer[]> {
    const txns = await getAndSignRemoteTxns(
      provider!,
      WUMBO_IDENTITY_SERVICE_URL + "/relink",
      {
        prevWallet: prevWallet!.toBase58(),
        newWallet: newWallet!.toBase58()
      }
    );
    disconnect();
    setTxns(txns);
    setSelecting("final");
    return txns;
  }
  const { loading: linking1, execute, error } = useAsyncCallback(relinkTxns);

  console.log(txns);
  const { loading: linking2, execute: submit, error: submitError } = useAsyncCallback(relinkSubmit);
  const linking = linking1 || linking2;

  useEffect(() => {
    if (publicKey) {
      if (selecting == "prev") {
        !newWallet?.equals(publicKey) && setPrevWallet(publicKey || undefined)
      } else if (selecting == "new") {
        setNewWallet(publicKey || undefined)
        setPrevWallet(undefined);
      } else if (selecting == "final") {
        if (newWallet!.equals(publicKey)) {
          submit(tokenCollectiveSdk, provider, txns).catch((e) => {
            setTxns(undefined);
            throw e;
          });
        } else {
          disconnect()
        }
      }
    }
  }, [selecting, publicKey, setPrevWallet, setNewWallet]);


  const { handleErrors } = useErrorHandler();
  handleErrors(error, submitError);

  const walletSelect = (selecting: Selecting) => <Button
    w="full"
    colorScheme="indigo"
    isLoading={!connected}
    onClick={() => {
      disconnect();
      setSelecting(selecting);
    }}
  >
    Select
  </Button>

  return <VStack w="full" spacing={4} p={4}>
    <Heading fontSize="xl">Relink Wallet</Heading>
    <Box>
      {txns && <Text fontSize="lg" fontWeight="bold">Please connect the new wallet</Text>}
      {!connected && <WalletSelect />}
    </Box>
    
    {connected &&
      <>
        <FormControl>
          <FormLabel>New Wallet</FormLabel>
          {newWallet && <Input
            disabled={true}
            value={newWallet.toBase58()}
          />}
          {walletSelect("new")}
        </FormControl>
        <FormControl>
          <FormLabel>Current Wallet</FormLabel>
          {prevWallet && <Input
            value={prevWallet.toBase58()}
            disabled={true}
          />}
          {walletSelect("prev")}
        </FormControl>

        <Button 
          colorScheme="red"
          onClick={() => newWallet && prevWallet && execute()}
          loading={linking}
          disabled={!newWallet || !prevWallet || linking}
        >
          { awaitingApproval ? "Awaiting Approval" : "Relink" }
        </Button>
      </>
    }
  </VStack>
}
