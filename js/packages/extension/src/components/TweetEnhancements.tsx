import React, { Fragment } from "react";
import { useTweets } from "../utils/spotter";
import { AppendChildPortal } from "wumbo-common";
import { MainButton } from "./MainButton";
import { ReplyTokens } from "./ReplyTokens";

export default () => {
  const tweets = useTweets();
  const btnCache = new Map<string, JSX.Element>();
  const tokenReplyCache = new Map<string, JSX.Element>();
  const getOrElseUpdate = (
    cache: Map<string, JSX.Element>,
    name: string,
    updateFn: () => JSX.Element
  ) => {
    if (cache.has(name)) {
      return cache.get(name)!;
    }

    const newVal = updateFn();
    cache.set(name, newVal);
    return newVal;
  };

  if (tweets) {
    const tweetEls = tweets
      .map((tweet, tweetIndex) => {
        const nameEl = tweet.querySelector("a");
        if (nameEl) {
          const name = nameEl.href.split("/").slice(-1)[0];
          const imgEl = nameEl.querySelector("img");
          const replyRow = tweet.children[1]?.children[1]?.firstChild;
          const insertButtonDiv = tweet.firstChild?.firstChild;

          // Will always have 1 mention ie the @ of the creator from then name
          // so if its longer than 1 we have other user mentions
          const isReply = tweet.textContent?.includes("Replying to");
          const replyMentions =
            isReply && replyRow!.textContent!.match(/\B@(\w+)/g);
          const insertReplyDiv =
            tweet.children[1].children[1]?.lastChild?.previousSibling;

          const buttonEl = insertButtonDiv
            ? getOrElseUpdate(btnCache, name, () => (
                <MainButton creatorName={name} creatorImg={imgEl?.src || ""} />
              ))
            : null;

          const replyTokensEl = buttonEl
            ? getOrElseUpdate(tokenReplyCache, `${name}${tweetIndex}`, () => (
                <ReplyTokens
                  creatorName={name}
                  mentions={replyMentions as string[]}
                />
              ))
            : null;

          if (buttonEl) {
            return (
              <Fragment key={name}>
                <AppendChildPortal container={insertButtonDiv as Element}>
                  <div className="flex justify-center mt-1.5">{buttonEl}</div>
                </AppendChildPortal>
                {isReply && (
                  <AppendChildPortal container={insertReplyDiv as Element}>
                    {replyTokensEl}
                  </AppendChildPortal>
                )}
              </Fragment>
            );
          }
        }

        return null;
      })
      .filter(Boolean);

    return <Fragment>{tweetEls}</Fragment>;
  }

  return null;
};
