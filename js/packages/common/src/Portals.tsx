import React from "react";
import ReactDOM from "react-dom";

interface IPrependedPortalProps {
  container: Element;
}

export class PrependedPortal extends React.Component<IPrependedPortalProps> {
  portalContainer = document.createElement("div");

  componentDidMount() {
    this.props.container.prepend(this.portalContainer);
  }

  componentWillUnmount() {
    this.props.container.removeChild(this.portalContainer);
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.portalContainer);
  }
}

interface IAppendChildPortal {
  container: Element;
}

export class AppendChildPortal extends React.Component<IAppendChildPortal> {
  portalContainer = document.createElement("div");

  componentDidMount() {
    this.props.container.appendChild(this.portalContainer);
  }

  componentWillUnmount() {
    this.props.container.removeChild(this.portalContainer);
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.portalContainer);
  }
}
