import React, { useState } from "react";
import { Button, Alert } from "wumbo-common";
import { WebAuth } from "auth0-js";

const auth0 = new WebAuth({
  clientID: "GPsjYroOyNKWCScIk2woGZi4kBTGDDTW",
  domain: "wumbo.us.auth0.com",
});

const Popup: React.FC = () => {
  const [showWalletConnect, setShowWalletConnect] = useState<boolean>(false);

  return (
    <div className="flex flex-col py-4 w-64">
      <Button
        onClick={() => {
          chrome.runtime.sendMessage({ type: "TRY_CLAIM" });
          // auth0.authenticate({
          //   grantType: 'authorization-code',
          //   connection: 'twitter',
          //   redirectUri: "https://hello.com/en/index.html"
          // })
        }}
      >
        Auth0 try
      </Button>
      {!showWalletConnect && (
        <div className="w-full px-4">
          <Button
            color="primary"
            onClick={() => setShowWalletConnect(true)}
            block
          >
            Connect Wallet
          </Button>
        </div>
      )}
    </div>
  );
};

export default Popup;
