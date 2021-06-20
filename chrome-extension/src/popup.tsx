import React, { useState } from "react";
import ReactDOM from "react-dom";
import { ConnectionProvider } from "@oyster/common/lib/contexts/connection";
import "antd/dist/antd.css";
import DefaultPage from "./components/popup/DefaultPage";
import SelectWalletPage from "./components/popup/SelectWalletPage";
import { WalletProvider } from "./utils/wallet";
import { Alert, Button } from "antd";
import { WebAuth } from "auth0-js";

const auth0 = new WebAuth({
  clientID: "GPsjYroOyNKWCScIk2woGZi4kBTGDDTW",
  domain: "wumbo.us.auth0.com"
})

const Popup = () => {
  const [page, setPage] = useState<string>("DEFAULT");
  return (
    <div style={{ width: "400px", height: "100px" }}>
      <Button
        onClick={() => {
          chrome.runtime.sendMessage({ type: "TRY_CLAIM" })
          // auth0.authenticate({
          //   grantType: 'authorization-code',
          //   connection: 'twitter',
          //   redirectUri: "https://hello.com/en/index.html"
          // })
        }}
      >Auth0 try</Button>
      <WalletProvider>
        {page == "DEFAULT" && (
          <DefaultPage selectWallet={() => setPage("SELECT_WALLET")} />
        )}
        {page == "SELECT_WALLET" && <SelectWalletPage />}
      </WalletProvider>
    </div>
  );
};

try {
  ReactDOM.render(
    <React.StrictMode>
      <ConnectionProvider>
        <Popup />
      </ConnectionProvider>
    </React.StrictMode>,
    document.getElementById("root")
  );
} catch (e) {
  ReactDOM.render(
    <React.StrictMode>
      <Alert message={e} type="error" />
    </React.StrictMode>,
    document.getElementById("root")
  );
}
