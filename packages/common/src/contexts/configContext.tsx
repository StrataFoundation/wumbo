import { PublicKey } from "@solana/web3.js";
import { WUMBO_IDENTITY_SERVICE_URL } from "../constants/globals";
import React from "react";
import axios from "axios";
import { useAsync } from "react-async-hook";

export interface IWumboConfig {
  tlds: {
    twitter: PublicKey;
  };
  verifiers: {
    twitter: PublicKey;
  };
  feeWallet: PublicKey;
  goLiveUnixTime: number;
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
    return config;
  } catch (e: any) {
    console.error(e);
    return DEFAULT_CONFIG;
  }
}

const DEFAULT_CONFIG = {
  tlds: {
    twitter: new PublicKey("Fhqd3ostRQQE65hzoA7xFMgT9kge2qPnsTNAKuL2yrnx"),
  },
  verifiers: {
    twitter: new PublicKey("DTok7pfUzNeNPqU3Q6foySCezPQE82eRyhX1HdhVNLVC"),
  },
  feeWallet: new PublicKey("wumbo8oWB2xsFs1V2VhcUDwyN3edoa3UuSnJJuG4qko"),
  goLiveUnixTime: 1642604400,
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
