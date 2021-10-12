import React from "react";
import ReactDOM from "react-dom";
import { Alert, AlertIcon } from "@chakra-ui/react";
import { ConnectionProvider } from "@oyster/common";
import Popup from "./Popup";

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
      <Alert status="error">
        <AlertIcon />
        {e}
      </Alert>
    </React.StrictMode>,
    document.getElementById("root")
  );
}
