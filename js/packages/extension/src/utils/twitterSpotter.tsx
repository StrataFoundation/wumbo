import { useEffect, useState } from "react";
import isEqual from "lodash/isEqual";
import { useInterval } from "wumbo-common";

const twitterMentionRegex = /(?:^|[^a-zA-Z0-9_@＠])(@|＠)(?!\.)([a-zA-Z0-9_\.]{1,15})(?:\b(?!@)|$)/g;

function getElementsBySelector(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector).entries()).map(
    ([_, ref]) => ref
  );
}

export const useProfile = (): {
  name: string;
  buttonTarget: Element | null;
  avatar?: string;
} | null => {
  const [result, setResult] = useState<{
    name: string;
    buttonTarget: Element | null;
    avatar?: string;
  } | null>(null);

  useInterval(() => {
    let newResult = null;

    const dataTestMatches = [
      "sendDMFromProfile",
      "userActions",
      "UserProfileHeader_Items",
      "UserDescription",
    ].some(
      (dataTestId) => !!document.querySelector(`div[data-testid=${dataTestId}]`)
    );

    if (dataTestMatches) {
      // High chance the page is profile
      const userActions = document.querySelector(
        'div[data-testid="userActions"]'
      );
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
            buttonTarget: buttonTarget as Element,
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

interface ITweet {
  name: string;
  buttonTarget: Element | null;
  avatar?: string;
  mentions?: string[] | null;
  replyTokensTarget?: Element | null;
}

export const useTweets = (): ITweet[] | null => {
  const [tweets, setTweets] = useState<ITweet[]>([]);

  useEffect(() => {
    const cache = new Set<Element>();
    const notCached = (el: Element): boolean => {
      return !cache.has(el);
    };

    const getTweets = () => {
      const tweets = getElementsBySelector('div[data-testid="tweet"]').filter(
        notCached
      );

      if (tweets.length > 0) {
        tweets.forEach((t) => cache.add(t));

        const parsedTweets = tweets.reduce((acc: any, tweet: any): ITweet[] => {
          const nameEl = tweet.querySelector("a");
          if (nameEl) {
            const name = nameEl.href.split("/").slice(-1)[0];
            const imgEl = nameEl.querySelector("img");
            const buttonTarget = tweet.firstChild?.firstChild;
            let mentions: string[] | null = null;
            let replyTokensTarget: Element | null = null;

            if (buttonTarget) {
              mentions = tweet.parentNode.innerText
                .split("\n")
                .join(" ")
                .match(twitterMentionRegex);

              if (mentions?.length) {
                replyTokensTarget =
                  tweet.children[1].children[1]?.lastChild?.previousSibling ||
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

    setInterval(getTweets, 1000);
  }, []);

  return tweets;
};

export const useUserCells = ():
  | {
      name: string;
      buttonTarget: HTMLElement | null;
      avatar?: string;
    }[]
  | null => {
  const [userCells, setUserCells] = useState<
    { name: string; buttonTarget: HTMLElement | null; avatar?: string }[]
  >([]);

  useEffect(() => {
    const cache = new Set<Element>();
    const notCached = (el: Element): boolean => {
      return !cache.has(el);
    };

    const getUserCells = () => {
      const userCells = getElementsBySelector(
        'div[data-testid="UserCell"]'
      ).filter(notCached);

      if (userCells.length > 0) {
        userCells.forEach((uc) => cache.add(uc));

        const parsedUserCells = userCells.reduce((acc: any, cell: any) => {
          const nameEl = cell.querySelector("a");
          if (nameEl) {
            const name = nameEl.href.split("/").slice(-1)[0];
            const imgEl = nameEl.querySelector("img");
            const buttonTarget =
              cell.querySelector('div[data-testid$="follow"')?.parentNode ||
              null;

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

        setUserCells((oldCells) => [...(oldCells || []), ...parsedUserCells]);
      }
    };

    setInterval(getUserCells, 1000);
  }, []);

  return userCells;
};
