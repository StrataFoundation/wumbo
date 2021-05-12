import Decorator from "./decorator";
import {Connection} from "@solana/web3.js";

export default class UserDecorator implements Decorator {
  solanaConnection: Connection

  constructor(solanaConnection: Connection) {
    this.solanaConnection = solanaConnection

    this.decorate = this.decorate.bind(this)
  }

  decorate(el: Element): void {

  }
}