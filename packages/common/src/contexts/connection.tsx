import { useLocalStorage } from "../utils";
import { SOLANA_API_URL } from "../constants";
import React, { useContext, useMemo, useEffect } from "react";
import { Connection, Keypair } from "@solana/web3.js";
import { DEFAULT_COMMITMENT } from "../constants/globals";

interface ConnectionConfig {
  connection: Connection;
  endpoint: string;
  setEndpoint: (val: string) => void;
}

const ConnectionContext = React.createContext<ConnectionConfig>({
  endpoint: SOLANA_API_URL,
  setEndpoint: () => {},
  connection: new Connection(SOLANA_API_URL, DEFAULT_COMMITMENT),
});

export function useConnection() {
  return useContext(ConnectionContext).connection as Connection;
}

export const ConnectionProvider: React.FC = ({ children }) => {
  const [endpoint, setEndpoint] = useLocalStorage(
    "connectionEndpoint",
    SOLANA_API_URL
  );

  const connection = useMemo(
    () => new Connection(endpoint, DEFAULT_COMMITMENT),
    [endpoint]
  );

  // The websocket library solana/web3.js uses closes its websocket connection when the subscription list
  // is empty after opening its first time, preventing subsequent subscriptions from receiving responses.
  // This is a hack to prevent the list from every getting empty
  useEffect(() => {
    const id = connection.onAccountChange(
      Keypair.generate().publicKey,
      () => {}
    );
    return () => {
      connection.removeAccountChangeListener(id);
    };
  }, [connection]);

  useEffect(() => {
    const id = connection.onSlotChange(() => null);
    return () => {
      connection.removeSlotChangeListener(id);
    };
  }, [connection]);

  return (
    <ConnectionContext.Provider
      value={{
        endpoint,
        setEndpoint,
        connection,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
