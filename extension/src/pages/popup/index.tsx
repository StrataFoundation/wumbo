import React from "react";
import ReactDOM from "react-dom";
import { ConnectionProvider } from "@oyster/common/lib/contexts/connection";
import Popup from "./Popup";
import { Alert } from "@/components/common";
import "windi.css";

try {
  ReactDOM.render(
    <React.StrictMode>
      <ConnectionProvider>
        <Popup />
      </ConnectionProvider>
    </React.StrictMode>,
    document.querySelector("#root")
  );
} catch (e) {
  ReactDOM.render(
    <React.StrictMode>
      <Alert message={e} type="error" />
    </React.StrictMode>,
    document.getElementById("root")
  );
}
