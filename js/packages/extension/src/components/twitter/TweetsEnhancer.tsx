import React, { Fragment } from "react";
import ReactShadow from "react-shadow/emotion";
import { ThemeProvider, CSSReset, Box } from "@chakra-ui/react";
import { theme } from "@/theme";

import { AppendChildPortal } from "wumbo-common";
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

  if (tweets) {
    const tweetEls = tweets
      .map((tweet, tweetIndex) => {
        const buttonEl = tweet.buttonTarget ? (
          <MainButton
            creatorName={tweet.name}
            creatorImg={tweet.avatar || ""}
          />
        ) : null;

        const replyTokensEl = tweet.replyTokensTarget ? (
          <ReplyTokens
            creatorName={tweet.name}
            mentions={tweet.mentions || []}
          />
        ) : null;
        if (buttonEl) {
          return (
            <Fragment key={getElementId(tweet.buttonTarget)}>
              <AppendChildPortal container={tweet.buttonTarget as Element}>
                <ReactShadow.div>
                  <ThemeProvider theme={theme} cssVarsRoot=":host,:root">
                    <CSSReset />
                    <Box d="flex" justifyContent="center" marginTop="6px">
                      {buttonEl}
                    </Box>
                  </ThemeProvider>
                </ReactShadow.div>
              </AppendChildPortal>
              {tweet.replyTokensTarget && (
                <AppendChildPortal
                  container={tweet.replyTokensTarget as Element}
                >
                  <ReactShadow.div>
                    <ThemeProvider theme={theme}>
                      <CSSReset />
                      <Box>{replyTokensEl}</Box>
                    </ThemeProvider>
                  </ReactShadow.div>
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
