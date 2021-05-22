import React from "react";
import ReactDOM from "react-dom"
import App from "./components/App";

const mountElem = document.createElement("div")
document.body.append(mountElem)

ReactDOM.render(
  <App />,
  mountElem
)