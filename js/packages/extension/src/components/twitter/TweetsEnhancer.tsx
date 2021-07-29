import React, { Fragment } from "react";
import { AppendChildPortal } from "wumbo-common";
import { useTweets } from "../../utils/twitterSpotter";
import { MainButton } from "../MainButton";
import { ReplyTokens } from "../ReplyTokens";

export const TweetsEnhancer = () => {
  const tweets = useTweets();
  const btnCache = new Map<string, JSX.Element>();
  const tokenReplyCache = new Map<string, JSX.Element>();

  const getOrElseUpdate = (
    cache: Map<string, JSX.Element>,
    name: string,
    updateFn: () => JSX.Element
  ) => {
    if (cache.has(name)) return cache.get(name)!;

    const newVal = updateFn();
    cache.set(name, newVal);
    return newVal;
  };

  if (tweets) {
    const tweetEls = tweets
      .map((tweet, tweetIndex) => {
        const buttonEl = tweet.buttonTarget
          ? getOrElseUpdate(btnCache, tweet.name, () => (
              <MainButton
                creatorName={tweet.name}
                creatorImg={tweet.avatar || ""}
              />
            ))
          : null;

        const replyTokensEl = tweet.replyTokensTarget
          ? getOrElseUpdate(
              tokenReplyCache,
              `${tweet.name}${tweetIndex}`,
              () => (
                <ReplyTokens
                  creatorName={tweet.name}
                  mentions={tweet.mentions || []}
                />
              )
            )
          : null;

        if (buttonEl) {
          return (
            <Fragment key={tweet.name}>
              <AppendChildPortal container={tweet.buttonTarget as Element}>
                <div className="flex justify-center mt-1.5">{buttonEl}</div>
              </AppendChildPortal>
              {tweet.replyTokensTarget && (
                <AppendChildPortal
                  container={tweet.replyTokensTarget as Element}
                >
                  {replyTokensEl}
                </AppendChildPortal>
              )}
            </Fragment>
          );
        }

        return null;
      })
      .filter(Boolean);

    return <Fragment>{tweetEls}</Fragment>;
  }

  return null;
};
