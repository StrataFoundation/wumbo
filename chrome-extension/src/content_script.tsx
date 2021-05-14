import React from "react";
import ReactDOM from "react-dom"
import App from "./components/App";


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.color) {
    console.log("Receive color = " + msg.color);
    document.body.style.backgroundColor = msg.color;
    sendResponse("Change color to " + msg.color);
  } else {
    sendResponse("Color message is none.");
  }
});

const mountElem = document.createElement("div")
document.body.append(mountElem)

ReactDOM.render(
  <App />,
  mountElem
)