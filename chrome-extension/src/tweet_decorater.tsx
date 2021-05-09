import Decorator from "./decorator";
import {Account, Connection, PublicKey} from "@solana/web3.js";
import getLinkButton from "./link_dom_button";
import {getHashedName, getNameAccountKey, NameRegistryState} from "@bonfida/spl-name-service";
import {
  KEYPAIR,
  SOLCLOUT_INSTANCE_KEY,
  SOLCLOUT_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TWITTER_ROOT_PARENT_REGISTRY_KEY
} from "./globals";
import {createSolcloutCreator} from "./solclout-api/bindings";
import {SolcloutCreator} from "./solclout-api/state";
import CreatorStore from "./creator_store";

export default class TweetDecorator implements Decorator {
  creatorStore: CreatorStore

  constructor(creatorStore: CreatorStore) {
    this.creatorStore = creatorStore

    this.decorate = this.decorate.bind(this)
  }

  async decorate(el: Element): Promise<void> {
    const nameEl = el.querySelector("a")
    if (nameEl) {
      const name = nameEl.href.split("/").slice(-1)[0]

      const insertDiv = el.querySelector("time")?.parentNode?.parentNode

      console.log(name)
      try {
        const worthSpan = document.createElement("span")
        worthSpan.innerHTML = (await this.creatorStore.getWorth(name)).toString()
        worthSpan.style.fontFamily = "inherit"
        worthSpan.style.font = "inherit"
        worthSpan.style.marginLeft = "2px"

        insertDiv?.appendChild(worthSpan)
      } catch(ex) {
        const button = getLinkButton("Create Coin")
        button.onclick = () => {
          this.creatorStore.create(name)
        }
        insertDiv?.appendChild(button)
      }
      // const data = (await NameRegistryState.retrieve(this.solanaConnection, twitterHandleRegistryKey)).data
    }
  }
}