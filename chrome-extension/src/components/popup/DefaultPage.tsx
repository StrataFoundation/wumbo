import ConnectButton from "../ConnectButton";
import { Alert, Card, Tag } from "antd";
import React from "react";
import { useWallet } from "../../utils/wallet";

export default ({ selectWallet }: { selectWallet: () => void }) => {
  // const { login, logout, accountInfo: { account, error, solcloutAccount  } } = useLoginFromPopup()
  const { wallet, error } = useWallet();
  return (
    <>
      <ConnectButton allowWalletChange selectWallet={selectWallet} />
      {wallet && wallet.publicKey && (
        <Card size="small" title="Wallet">
          <Tag>{wallet.publicKey.toBase58()}</Tag>
        </Card>
      )}
      {/*{solcloutAccount &&*/}
      {/*<Card size="small" title="Solclout Account">*/}
      {/*    <Tag>{solcloutAccount.address.toBase58()}</Tag>*/}
      {/*    <Statistic title="Balance" value={solcloutAccount.amount.toNumber().toFixed(2)}/>*/}
      {/*</Card>*/}
      {/*}*/}
      {error && <Alert type="error" message={error.toString()} />}
    </>
  );
};
