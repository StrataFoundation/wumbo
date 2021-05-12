import Decorator from "./decorator";
import {Account, Connection} from "@solana/web3.js";
import getLinkButton from "./linkDomButton";
import {KEYPAIR, SOLCLOUT_PROGRAM_ID, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID} from "../globals";
import {buyCreatorCoinsWithWallet} from "../solclout-api/bindings";
import CreatorStore from "../utils/creatorStore";

export default class TweetDecorator implements Decorator {
  creatorStore: CreatorStore
  solanaConnection: Connection

  constructor(creatorStore: CreatorStore, solanaConnection: Connection) {
    this.creatorStore = creatorStore
    this.solanaConnection = solanaConnection

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
        const creator = await this.creatorStore.getCreator(name)
        const mintInfo = await creator.getMint(this.solanaConnection)
        const solcloutPrice = Math.pow(mintInfo.supply.toNumber() / Math.pow(10, 9), 3) / 1000

        worthSpan.innerHTML = (solcloutPrice).toPrecision(2)
        worthSpan.style.fontFamily = "inherit"
        worthSpan.style.font = "inherit"
        worthSpan.style.marginLeft = "2px"

        const buyButton = getLinkButton("Buy")
        buyButton.onclick = () => {
          buyCreatorCoinsWithWallet(this.solanaConnection, {
            programId: SOLCLOUT_PROGRAM_ID,
            splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
            solcloutCreator: creator.publicKey,
            purchaserWallet: new Account(KEYPAIR.secretKey),
            lamports: 10000000000
          })
        }

        insertDiv?.appendChild(worthSpan)
        insertDiv?.appendChild(buyButton)
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