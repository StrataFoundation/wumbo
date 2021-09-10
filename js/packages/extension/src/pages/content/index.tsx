import React from "react";
import ReactDOM from "react-dom";
import App from "../../components/App";
import "windi.css";

const appMountElem = document.createElement("div");
appMountElem.setAttribute("id", "WUM");
document.body.append(appMountElem);

// @ts-ignore
window.isExtension = true;

const scriptMountElem = document.createElement("script");
scriptMountElem.src = chrome.runtime.getURL("wallet_proxy.js");
scriptMountElem.onload = function () {
  (this as any).remove();
};
(document.head || document.documentElement).appendChild(scriptMountElem);

ReactDOM.render(<App />, appMountElem);
