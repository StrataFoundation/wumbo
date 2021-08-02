import React from "react";
import ReactDOM from "react-dom";
import App from "../../components/App";
import "windi.css";

const mountElem = document.createElement("div");
document.body.append(mountElem);

window.addEventListener("message", function (event) {
  console.log("content_script.js got message:", event);
  // check event.type and event.data
});

setTimeout(function () {
  console.log("cs sending message");
  window.postMessage(
    { type: "content_script_type", text: "Hello from content_script.js!" },
    "*" /* targetOrigin: any */
  );
}, 1000);

ReactDOM.render(<App />, mountElem);
