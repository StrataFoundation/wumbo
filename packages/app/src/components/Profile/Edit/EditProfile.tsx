import React from "react";
import { useHistory } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { EditProfile } from "wumbo-common";
import { Routes } from "../../../constants/routes";
import WalletRedirect from "../../Wallet/WalletRedirect";

export const EditProfileRoute: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const history = useHistory();

  if (!connected || !publicKey) {
    return <WalletRedirect />;
  }

  return (
    <>
      <WalletRedirect />
      <EditProfile
        ownerWalletKey={publicKey!}
        onComplete={() => history.push(Routes.profile.path)}
      />
    </>
  );
};
