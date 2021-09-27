import "../../bufferFill";
import React from "react";
import ReactDOM from "react-dom";
import ReactShadow from "react-shadow/emotion";
import App from "../../components/App";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

Sentry.init({
  dsn: "https://e96dd4794c994327b30d81ec8edcb775@o1014639.ingest.sentry.io/5979871",
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

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

ReactDOM.render(
  <ReactShadow.div>
    <App />
  </ReactShadow.div>,
  appMountElem
);
