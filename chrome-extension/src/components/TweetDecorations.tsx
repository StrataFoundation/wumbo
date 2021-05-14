import React from "react"
import {useTweets} from "../utils/spotter";
import ReactDOM from "react-dom"
import CreatorInfo from "./CreatorInfo";
import {ENDPOINTS, useConnectionConfig} from "@oyster/common/lib/contexts/connection"

export default () => {
  const connectionConfig = useConnectionConfig();
  connectionConfig.setEndpoint(ENDPOINTS[3].endpoint)

  const tweets = useTweets()
  if (tweets) {
    const elCache = new Map<string, JSX.Element>()
    function getOrElseUpdate(name: string, updateFn: () => JSX.Element) {
      if (elCache.has(name)) {
        return elCache.get(name)
      }

      const newVal = updateFn()
      elCache.set(name, newVal)
      return newVal
    }
    const tweetEls = tweets.map(tweet => {
      const nameEl = tweet.querySelector("a")
      if (nameEl) {
        const name = nameEl.href.split("/").slice(-1)[0]
        const insertDiv = tweet.querySelector("time")?.parentNode?.parentNode
        if (insertDiv) {
          const el = getOrElseUpdate(name, () => <CreatorInfo
            creatorName={name}
            onBuy={() => {
            }}
          />)

          return ReactDOM.createPortal(
            <div
              key={tweet.id}
              style={{ marginLeft: "4px" }}
            >
              { el }
            </div>,
            // @ts-ignore
            insertDiv
          );
        }
      }

      return null
    }).filter(Boolean)

    return <>
      { tweetEls }
    </>
  }

  return null
}