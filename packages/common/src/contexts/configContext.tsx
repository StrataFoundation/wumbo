import { PublicKey } from "@solana/web3.js";
import {
  NFT_VERIFIER_URL,
  WUMBO_IDENTITY_SERVICE_URL,
} from "../constants/globals";
import React from "react";
import axios from "axios";
import { useAsync } from "react-async-hook";

export interface IWumboConfig {
  tlds: {
    twitter: PublicKey;
    nftVerifier: PublicKey;
  };
  verifiers: {
    twitter: PublicKey;
    nftVerifier: PublicKey;
  };
  tweets: {
    claim: string[];
    mint: string[];
    swap: string[];
  };
  feeWallet: PublicKey;
  goLiveUnixTime: number;
  nftMismatchThreshold: number;
}

let config: IWumboConfig;
export async function fetchConfig(): Promise<IWumboConfig> {
  if (config) {
    return config;
  }

  try {
    config = await (
      await axios.get(WUMBO_IDENTITY_SERVICE_URL + "/config")
    ).data;
    config.verifiers.twitter = new PublicKey(config.verifiers.twitter);
    config.tlds.twitter = new PublicKey(config.tlds.twitter);
    config.feeWallet = new PublicKey(config.feeWallet);
  } catch (e: any) {
    config = DEFAULT_CONFIG;
    console.error(e);
  }

  try {
    const nftConfig = await (
      await axios.get(NFT_VERIFIER_URL + "/config")
    ).data;
    config.verifiers.nftVerifier = new PublicKey(nftConfig.verifier);
    config.tlds.nftVerifier = new PublicKey(nftConfig.tld);
    config.nftMismatchThreshold = nftConfig.mismatchThreshold;
  } catch (e: any) {
    config.verifiers.nftVerifier = DEFAULT_CONFIG.verifiers.nftVerifier;
    config.tlds.nftVerifier = DEFAULT_CONFIG.tlds.nftVerifier;
    config.nftMismatchThreshold = DEFAULT_CONFIG.nftMismatchThreshold;
    console.error(e);
  }

  return config;
}

const DEFAULT_CONFIG = {
  tlds: {
    twitter: new PublicKey("Fhqd3ostRQQE65hzoA7xFMgT9kge2qPnsTNAKuL2yrnx"),
    nftVerifier: new PublicKey("AAsDoQzMNB1FQuESJFD9FtaL2ipBXPVbA45HQaBsSPan"),
  },
  verifiers: {
    twitter: new PublicKey("DTok7pfUzNeNPqU3Q6foySCezPQE82eRyhX1HdhVNLVC"),
    nftVerifier: new PublicKey("Gzyvrg8gJfShKQwhVYFXV5utp86tTcMxSzrN7zcfebKj"),
  },
  tweets: {
    claim: [
      "I just claimed my #socialtoken on @TeamWumbo! You can get it at wum.bo/t/{handle}",
    ],
    mint: [
      "Hey @{handle}, I created a #socialtoken for you on @TeamWumbo. You should claim it so I can ...",
    ],
    swap: [
      "Just grabbed a bag of @{handle}'s #socialtoken on @TeamWumbo because...",
    ],
  },
  feeWallet: new PublicKey("wumbo8oWB2xsFs1V2VhcUDwyN3edoa3UuSnJJuG4qko"),
  goLiveUnixTime: 1642604400,
  nftMismatchThreshold: 50,
};
export const ConfigContext = React.createContext<IWumboConfig>(DEFAULT_CONFIG);

export const ConfigProvider: React.FC = ({ children }) => {
  const { result: config } = useAsync(fetchConfig, []);
  return (
    <ConfigContext.Provider value={config || DEFAULT_CONFIG}>
      {children}
    </ConfigContext.Provider>
  );
};
