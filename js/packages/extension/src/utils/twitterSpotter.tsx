import { useEffect, useState } from "react";
import isEqual from "lodash/isEqual";
import { useInterval } from "wumbo-common";
import { getElementsBySelector } from "./elements";

const twitterMentionRegex =
  /(?:^|[^a-zA-Z0-9_@＠])(@|＠)(?!\.)([a-zA-Z0-9_\.]{1,15})(?:\b(?!@)|$)/g;

interface IParsedProfile {
  name: string;
  buttonTarget: HTMLElement | null;
  avatar?: string;
}

export const useProfile = (): IParsedProfile | null => {
  const [result, setResult] = useState<IParsedProfile | null>(null);

  useInterval(() => {
    let newResult = null;

    const dataTestMatches = [
      "sendDMFromProfile",
      "userActions",
      "UserProfileHeader_Items",
      "UserDescription",
    ].some((dataTestId) => !!document.querySelector(`[data-testid=${dataTestId}]`));

    if (dataTestMatches) {
      // High chance the page is profile
      const userActions = document.querySelector('[data-testid="userActions"]');
      const profile = userActions?.parentNode?.parentNode;

      if (userActions && profile) {
        const buttonTarget = userActions.parentNode;
        const nameEl = profile.querySelector("a");

        if (nameEl && buttonTarget) {
          const name = nameEl.href.split("/").slice(-2)[0];
          const imgEl = nameEl.querySelector("img");

          newResult = {
            name,
            avatar: imgEl?.src,
            buttonTarget: buttonTarget as HTMLElement,
          };
        }
      }
    }

    if (!isEqual(newResult, result)) {
      setResult(newResult);
    }
  }, 1000);

  return result;
};

export const useStatus = (): { isStatus: boolean } | null => {
  const [result, setResult] = useState<{ isStatus: boolean } | null>(null);

  useInterval(() => {
    let newResult = null;

    if (window.location.href.includes("/status/")) {
      newResult = { isStatus: true };
    }

    if (!isEqual(newResult, result)) {
      setResult(newResult);
    }
  }, 1000);

  return result;
};

interface IParsedTweet {
  name: string;
  buttonTarget: Element | null;
  avatar?: string;
  mentions?: string[] | null;
  replyTokensTarget?: Element | null;
}

enum Elements {
  TweetName,
  TweetProfilePic,
  TweetMintButton,
}

const findButtonTarget = (nameEl: HTMLElement) => {
  const traverseUp = (el: HTMLElement | null): HTMLElement | null => {
    if (!el) return null;
    // traverase upwards until the parent has a sibling.
    // we found the two columns that make up a tweet
    // the first holding the profile img
    if (el.parentElement!.nextSibling) return el.parentElement;
    return traverseUp(el.parentElement);
  };

  return traverseUp(nameEl);
};

export const useTweets = (): IParsedTweet[] | null => {
  const [tweets, setTweets] = useState<IParsedTweet[]>([]);

  useEffect(() => {
    const cache = new Set<Element>();
    const notCached = (el: Element): boolean => {
      return !cache.has(el);
    };

    const getTwets = () => {
      const tweets = getElementsBySelector('[data-testid="tweet"]').filter(notCached);

      if (tweets.length > 0) {
        tweets.forEach((t) => cache.add(t));

        const parsedTweets = tweets.reduce((acc: any, tweet: any): IParsedTweet[] => {
          const nameEl = tweet.querySelector("a");
          if (nameEl) {
            const name = nameEl.href.split("/").slice(-1)[0];
            const imgEl = nameEl.querySelector("img");
            const buttonTarget = findButtonTarget(nameEl);
            let mentions: string[] | null = null;
            let replyTokensTarget: Element | null = null;

            if (buttonTarget) {
              mentions = tweet.parentNode.innerText
                .split("\n")
                .join(" ")
                .match(twitterMentionRegex);

              if (mentions?.length) {
                replyTokensTarget =
                  tweet.children[1]?.children[1]?.lastChild?.previousSibling ||
                  tweet.parentNode.lastElementChild.children[
                    tweet.parentNode.lastElementChild.childNodes.length - 4
                  ];
              }
            }

            return [
              ...acc,
              {
                name,
                avatar: imgEl?.src,
                buttonTarget,
                mentions,
                replyTokensTarget,
              },
            ];
          }

          return acc;
        }, []);

        setTweets((oldTweets) => [...(oldTweets || []), ...parsedTweets]);
      }
    };

    setInterval(getTwets, 1000);
  }, []);

  return tweets;
};

interface IParsedUserCell {
  name: string;
  buttonTarget: HTMLElement | null;
  avatar?: string;
}

export const useUserCells = (): IParsedUserCell[] | null => {
  const [userCells, setUserCells] = useState<IParsedUserCell[]>([]);

  useInterval(() => {
    const userCells = getElementsBySelector('[data-testid="UserCell"]');

    if (userCells.length > 0) {
      const parsedUserCells = userCells.reduce((acc: any, cell: any) => {
        const nameEl = cell.querySelector("a");
        if (nameEl) {
          const name = nameEl.href.split("/").slice(-1)[0];
          const imgEl = nameEl.querySelector("img");
          const buttonTarget = cell.querySelector('[data-testid$="follow"')?.parentNode || null;

          return [
            ...acc,
            {
              name,
              avatar: imgEl?.src,
              buttonTarget,
            },
          ];
        }

        return acc;
      }, []);

      if (!isEqual(parsedUserCells, userCells)) {
        setUserCells(parsedUserCells);
      }
    }
  }, 1000);

  return userCells;
};
