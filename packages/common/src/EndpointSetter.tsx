import React, { useEffect } from "react";
import { SOLANA_API_URL } from "./constants/globals";
import { useConnectionConfig } from "@oyster/common";

export const EndpointSetter = ({ children = null as any }) => {
  const config = useConnectionConfig();
  useEffect(() => {
    if (config.endpoint != SOLANA_API_URL) {
      config.setEndpoint(SOLANA_API_URL);
    }
  }, [config.endpoint, config.setEndpoint]);

  if (config.endpoint == SOLANA_API_URL) {
    return children;
  }

  return null;
};
