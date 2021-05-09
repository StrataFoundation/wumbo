import Decorator from "./decorator";
import {Connection} from "@solana/web3.js";
import getLinkButton from "./link_dom_button";
import {getHashedName, getNameAccountKey, NameRegistryState} from "@bonfida/spl-name-service";
import {TWITTER_ROOT_PARENT_REGISTRY_KEY} from "./globals";

export default class TweetDecorator implements Decorator {
  solanaConnection: Connection

  constructor(solanaConnection: Connection) {
    this.solanaConnection = solanaConnection

    this.decorate = this.decorate.bind(this)
  }

  async decorate(el: Element): Promise<void> {
    const nameEl = el.querySelector("a")
    if (nameEl) {
      const name = nameEl.href.split("/").slice(-1)[0]

      const insertDiv = el.querySelector("time")?.parentNode?.parentNode

      let text = "Create Coin"
      const hashedName = await getHashedName(name)
      const twitterHandleRegistryKey = await getNameAccountKey(hashedName, undefined, TWITTER_ROOT_PARENT_REGISTRY_KEY)

      const data = (await NameRegistryState.retrieve(this.solanaConnection, twitterHandleRegistryKey)).data
      debugger
      insertDiv?.appendChild(getLinkButton(text))
    }
  }
}