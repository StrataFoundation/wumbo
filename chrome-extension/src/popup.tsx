import React from "react";
import ReactDOM from "react-dom";
import {Alert, Button, Card, Statistic, Tag} from "antd";
import {ConnectionProvider} from "@oyster/common/lib/contexts/connection"
import {useLoginFromPopup} from "./utils/auth";
import 'antd/dist/antd.css'

const Popup = () => {
  const { login, logout, accountInfo: { account, error, solcloutAccount  } } = useLoginFromPopup()

  return (
    <div style={{ width: "400px", height: "100px" }}>
      { !account && <Button onClick={login}>Login</Button> }
      <Button onClick={logout}>Logout</Button>
      { account &&
        <Card size="small" title="Wallet">
            <Tag>{account.publicKey.toBase58()}</Tag>
        </Card>
      }
      {solcloutAccount &&
        <Card size="small" title="Solclout Account">
            <Tag>{solcloutAccount.address.toBase58()}</Tag>
            <Statistic title="Balance" value={solcloutAccount.amount.toNumber().toFixed(2)}/>
        </Card>
      }
      { error && <Alert type="error" message={error} /> }
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <ConnectionProvider>
      <Popup/>
    </ConnectionProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
