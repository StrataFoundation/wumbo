import React, { Fragment, useRef } from "react";
import ReactShadow from "react-shadow/emotion";
import { Box } from "@chakra-ui/react";

import { AppendChildPortal, ThemeProvider } from "wumbo-common";
import { useTweets } from "../../utils/twitterSpotter";
import { MainButton } from "../MainButton";
import { ReplyTokens } from "../ReplyTokens";

let incrementingId = 0;
function getElementId(element: Element | null): string {
  if (!element) {
    return "";
  }

  if (!element.id) {
    incrementingId++;
    element.id = "tweet_id_" + incrementingId;
  }

  return element.id;
}

export const TweetsEnhancer = () => {
  const tweets = useTweets();
  const outsideRef = useRef() as React.MutableRefObject<HTMLInputElement>;

  if (tweets) {
    const tweetEls = tweets
      .map((tweet, tweetIndex) => {
        const buttonEl = tweet.buttonTarget ? (
          <MainButton
            buttonTarget={tweet.buttonTarget}
            creatorName={tweet.name}
            creatorImg={tweet.avatar || ""}
          />
        ) : null;

        const replyTokensEl =
          tweet.replyTokensTarget &&
          tweet.mentions &&
          tweet.mentions.length > 0 ? (
            <ReplyTokens
              outsideRef={outsideRef}
              creatorName={tweet.name}
              mentions={tweet.mentions || []}
            />
          ) : null;

        if (buttonEl) {
          return (
            <Fragment key={getElementId(tweet.buttonTarget)}>
              <AppendChildPortal container={tweet.buttonTarget as Element}>
                <ReactShadow.div>
                  <ThemeProvider>
                    <Box d="flex" justifyContent="center" marginTop="6px">
                      {buttonEl}
                    </Box>
                  </ThemeProvider>
                </ReactShadow.div>
              </AppendChildPortal>
              {tweet.replyTokensTarget &&
                tweet.mentions &&
                tweet.mentions.length > 0 && (
                  <AppendChildPortal
                    container={tweet.replyTokensTarget as Element}
                  >
                    <ReactShadow.div>
                      <ThemeProvider>{replyTokensEl}</ThemeProvider>
                    </ReactShadow.div>
                  </AppendChildPortal>
                )}
            </Fragment>
          );
        }

        return null;
      })
      .filter(Boolean);

    return (
      <Fragment>
        {tweetEls}
        <Box ref={outsideRef} />
      </Fragment>
    );
  }

  return null;
};
