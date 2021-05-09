import UserDecorator from "./user_decorator"
import TweetDecorator from "./tweet_decorater"
import {Connection} from "@solana/web3.js"

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.color) {
    console.log("Receive color = " + msg.color);
    document.body.style.backgroundColor = msg.color;
    sendResponse("Change color to " + msg.color);
  } else {
    sendResponse("Color message is none.");
  }
});

function getElementsBySelector(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector).entries())
    .map(([_, ref]) => ref)
}

const cache = new Set<Element>();

function notCached(el: Element): boolean {
  return !cache.has(el)
}

// const solanaConnection = new Connection("https://devnet.solana.com")
const solanaConnection = new Connection("https://api.mainnet-beta.solana.com")

const userDecorator = new UserDecorator(solanaConnection)
const tweetDecorator = new TweetDecorator(solanaConnection)

function annotate(): void {
  const tweets = getElementsBySelector("div[data-testid=\"tweet\"]")
    .filter(notCached)
  const users = getElementsBySelector("div[data-testid=\"UserCell\"]")
    .filter(notCached)

  users.forEach(userDecorator.decorate)
  tweets.forEach(tweetDecorator.decorate)

  users.forEach(u => cache.add(u))
  tweets.forEach(t => cache.add(t))
}

setInterval(annotate, 1000)
