import React from "react";
import ReactDOM from "react-dom";
import {Alert, Button, Tag} from "antd";
import {ConnectionProvider} from "@oyster/common/lib/contexts/connection"
import {useLoginFromPopup} from "./utils/action";
import 'antd/dist/antd.css'

const Popup = () => {
  const { login, account, error } = useLoginFromPopup()

  debugger;

  return (
    <div style={{ width: "400px", height: "100px" }}>
      { !account && <Button onClick={login}>Login</Button> }
      { account && <span>Your public key is: <Tag>{account.publicKey.toBase58()}</Tag></span> }
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
