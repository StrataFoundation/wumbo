import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { tokenAuthFetchMiddleware } from "@strata-foundation/web3-token-auth";
import React, { FC, useMemo } from "react";

// export const DEFAULT_ENDPOINT = "https://wumbo.genesysgo.net";
export const DEFAULT_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_URL || "https://api.devnet.solana.com";

export const getToken = (endpoint: string) => async () => {
  if (endpoint.includes("genesysgo")) {
    const req = await fetch("/api/get-token");
    const { access_token }: { access_token: string } = await req.json();
    return access_token;
  }

  return "";
};

export const Wallet = ({
  children,
  cluster,
}: {
  children: React.ReactNode;
  cluster?: string;
}) => {
  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter({}),
      new SolletExtensionWalletAdapter({}),
    ],
    []
  );

  const endpoint = cluster || DEFAULT_ENDPOINT;

  return (
    <ConnectionProvider
      endpoint={endpoint}
      config={{
        fetchMiddleware: tokenAuthFetchMiddleware({
          getToken: getToken(endpoint),
        }),
        commitment: "confirmed"
      }}
    >
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};
