import { PublicKey } from "@solana/web3.js";
import { WUMBO_IDENTITY_SERVICE_URL } from "@/constants";
import React from "react";
import axios from "axios";
import { useAsync } from "react-async-hook";
import { merge } from "lodash";

export interface IWumboConfig {
  tlds: {
    twitter: PublicKey;
  };
  verifiers: {
    twitter: PublicKey;
  };
}

const DEFAULT_CONFIG = {
  tlds: {
    twitter: new PublicKey("Fhqd3ostRQQE65hzoA7xFMgT9kge2qPnsTNAKuL2yrnx"),
  },
  verifiers: {
    twitter: new PublicKey("DTok7pfUzNeNPqU3Q6foySCezPQE82eRyhX1HdhVNLVC"),
  },
};

let config: IWumboConfig;

export const ConfigContext = React.createContext<IWumboConfig>(DEFAULT_CONFIG);

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
  } catch (e: any) {
    config = DEFAULT_CONFIG;
    console.error(e);
  }

  return merge(DEFAULT_CONFIG, config);
}

export const ConfigProvider: React.FC = ({ children }) => {
  const { result: config } = useAsync(fetchConfig, []);
  return (
    <ConfigContext.Provider value={config || DEFAULT_CONFIG}>
      {children}
    </ConfigContext.Provider>
  );
};
