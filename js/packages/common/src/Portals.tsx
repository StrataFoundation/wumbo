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

interface IClearance {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}
interface IFloatPortal {
  container: Element;
  clearance: IClearance;
}
export function pxToNum(px: string): number {
  return Number(px.replace(/px/g,'')) || 0
}

// Keep iterating elements until we get to an element that encloses this rect with extra clearance in terms of px
function clearSpace(node: Element | null, rect: DOMRect, clearance: IClearance): Element | null {
  if (node == null) {
    return null;
  }

  const styles = getComputedStyle(node);
  const currentRect = node.getBoundingClientRect();
  const hasEnoughSpace = (currentRect.left + (clearance.left || 0) + pxToNum(styles.borderLeftWidth)) < rect.left && 
                        (currentRect.right - (clearance.right || 0) - pxToNum(styles.borderRightWidth)) > rect.right &&
                        (currentRect.top + (clearance.top || 0) + pxToNum(styles.borderTopWidth)) < rect.top &&
                        (currentRect.bottom - (clearance.bottom || 0) - pxToNum(styles.borderBottomWidth)) > rect.bottom;
  if (!hasEnoughSpace) {
    return clearSpace(node.parentElement, rect, clearance)
  }

  return node;
}

export class FloatPortal extends React.Component<IFloatPortal> {
  portalContainer = document.createElement("div");
  div: HTMLElement | undefined;

  componentDidMount() {
    const bigEnoughParent = clearSpace(this.props.container, this.props.container.getBoundingClientRect(), this.props.clearance);
    if (!bigEnoughParent) {
      return
    }

    const imgRect = this.props.container.getBoundingClientRect();
    const parentRect = bigEnoughParent.getBoundingClientRect();
    const parentComp = getComputedStyle(bigEnoughParent)

    this.div = document.createElement("div");

    this.div.style.position = "absolute";
    this.div.style.top = (imgRect.top - parentRect.top - pxToNum(parentComp.borderTopWidth)) + "px";
    this.div.style.left = (imgRect.left - parentRect.left - pxToNum(parentComp.borderLeftWidth)) + "px";
    // @ts-ignore
    this.div.style.height = this.props.container.height + "px";
    // @ts-ignore
    this.div.style.width = this.props.container.width + "px";

    this.div.appendChild(this.portalContainer)
    bigEnoughParent.append(this.div)
  }

  componentWillUnmount() {
    this.div?.remove()
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.portalContainer);
  }
}

