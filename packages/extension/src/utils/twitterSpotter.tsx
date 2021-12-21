import { useEffect, useState } from "react";
import isEqual from "lodash/isEqual";
import { useInterval } from "@strata-foundation/react";
import { getVisibleElementsBySelector } from "./elements";
import * as Sentry from "@sentry/react";
import { truthy } from "wumbo-common";

const twitterMentionRegex =
  /(?:^|[^a-zA-Z0-9_@＠])(@|＠)(?!\.)([a-zA-Z0-9_\.]{1,15})(?:\b(?!@)|$)/g;

type ProfileType = "mine" | "other" | undefined;
interface IParsedProfile {
  name: string;
  buttonTarget: HTMLElement | null;
  avatar?: string;
  type: ProfileType;
}

const sanitizeMentions = (mentions: string[]) => [
  ...new Set(mentions.map((mention) => mention.replace(/[@ ]/g, ""))),
];

export const useProfile = (): IParsedProfile | null => {
  const [result, setResult] = useState<IParsedProfile | null>(null);

  useInterval(() => {
    let newResult = null;

    const dataTestMatches = [
      "sendDMFromProfile",
      "userActions",
      "UserProfileHeader_Items",
      "UserDescription",
    ].some(
      (dataTestId) => !!document.querySelector(`[data-testid=${dataTestId}]`)
    );

    if (dataTestMatches) {
      // High chance the page is profile
      const userActions = document.querySelector('[data-testid="userActions"]');
      const settings = document.querySelector('a[href="/settings/profile"]');
      const profile = (userActions || settings)?.parentNode?.parentNode;
      const nameEl = profile?.querySelector("a");
      const name = nameEl?.href.split("/").slice(-2)[0];
      const imgEl = nameEl?.querySelector("img");

      if (userActions && profile && nameEl && name) {
        const buttonTarget = userActions.parentNode;

        if (buttonTarget) {
          newResult = {
            name,
            avatar: imgEl?.src,
            buttonTarget: buttonTarget as HTMLElement,
            type: "other" as ProfileType,
          };
        }
      } else if (profile && nameEl && name && settings) {
        const buttonTarget = settings.parentNode;

        if (buttonTarget) {
          newResult = {
            name,
            avatar: imgEl?.src,
            buttonTarget: buttonTarget as HTMLElement,
            type: "mine" as ProfileType,
          };
        }
      }

      if (!isEqual(newResult, result)) {
        setResult(newResult);
      }
    } else {
      setResult(null);
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
  buttonTarget: HTMLElement | null;
  avatar?: string;
  mentions?: string[] | null;
  replyTokensTarget?: HTMLElement | null;
}

enum Elements {
  TweetName,
  TweetProfilePic,
  TweetMintButton,
}

function findChildWithDimension(
  el: HTMLElement,
  width: number,
  height: number
): HTMLElement | undefined {
  const children = [...el.children];
  const childWithWidth = children.find((c) => {
    const computed = getComputedStyle(c);
    return (
      computed.width == `${width}px` &&
      computed.height == `${height}px` &&
      computed.position != "absolute"
    );
  }) as HTMLElement;
  if (!childWithWidth) {
    for (const child of children) {
      const found = findChildWithDimension(child as HTMLElement, width, height);
      if (found) {
        return found;
      }
    }
  }

  return childWithWidth;
}

export const useTweets = (): IParsedTweet[] | null => {
  const [tweets, setTweets] = useState<IParsedTweet[]>([]);

  useEffect(() => {
    const cache = new Map<Element, IParsedTweet>();
    const notCached = (el: Element): boolean => {
      return !cache.has(el);
    };

    const getTweets = () => {
      const existingTweets = getVisibleElementsBySelector(
        '[data-testid="tweet"]'
      )
        .map(cache.get.bind(cache))
        .filter(truthy);
      const tweets = getVisibleElementsBySelector(
        '[data-testid="tweet"]'
      ).filter(notCached);
      if (tweets.length > 0) {
        const parsedTweets = tweets.reduce(
          (acc: any, tweet: any, index: number): IParsedTweet[] => {
            const buttonTarget =
              findChildWithDimension(tweet, 48, 48) ||
              findChildWithDimension(tweet, 32, 32);
            if (buttonTarget) {
              const nameEl = buttonTarget.querySelector("a");

              if (nameEl) {
                const name = nameEl.href.split("/").slice(-1)[0];
                const imgEl = nameEl.querySelector("img");
                let mentions: string[] | null = null;
                let replyTokensTarget: HTMLElement | undefined;

                mentions = tweet.parentNode.innerText
                  .split("\n")
                  .join(" ")
                  .match(twitterMentionRegex);

                // first mention is always user, remove it
                mentions?.shift();

                if (mentions?.length) {
                  mentions = sanitizeMentions(mentions);
                  replyTokensTarget = tweet.querySelectorAll(
                    `[href="/${name}"]`
                  )[1].parentNode.parentNode.parentNode.parentNode;
                }

                const ret = {
                  name,
                  avatar: imgEl?.src,
                  buttonTarget,
                  mentions,
                  replyTokensTarget,
                };
                cache.set(tweet, ret);

                return [...acc, ret];
              }
            }

            return acc;
          },
          []
        );

        setTweets([...existingTweets, ...parsedTweets]);
      }
    };

    setInterval(getTweets, 1000);
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
    const userCells = getVisibleElementsBySelector('[data-testid="UserCell"]');

    if (userCells.length > 0) {
      const parsedUserCells = userCells.reduce((acc: any, cell: any) => {
        const nameEl = cell.querySelector("a");
        if (nameEl) {
          const name = nameEl.href.split("/").slice(-1)[0];
          const imgEl = nameEl.querySelector("img");
          const buttonTarget =
            cell.querySelector('[data-testid$="follow"')?.parentNode || null;

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
