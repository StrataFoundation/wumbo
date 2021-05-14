import {useEffect, useState} from "react";

function getElementsBySelector(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector).entries())
    .map(([_, ref]) => ref)
}

// const users = getElementsBySelector("div[data-testid=\"UserCell\"]")
//   .filter(notCached)

export const useTweets = (): Element[] => {
  const [tweets, setTweets] = useState<Element[]>([])

  useEffect(() => {
    const cache = new Set<Element>();

    const notCached = (el: Element): boolean => {
      return !cache.has(el)
    }
    const getTweets = () => {
      const tweets = getElementsBySelector("div[data-testid=\"tweet\"]")
        .filter(notCached)

      if (tweets.length > 0) {
        tweets.forEach(t => cache.add(t))
        setTweets(oldTweets => [...oldTweets, ...tweets])
      }
    }

    setInterval(getTweets, 1000)
  }, [])

  return tweets
}