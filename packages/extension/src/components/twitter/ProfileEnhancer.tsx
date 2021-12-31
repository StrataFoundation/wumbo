import React, { Fragment, useEffect, useState, useCallback } from "react";
import ReactShadow from "react-shadow/emotion";
import { Box, Button, HStack } from "@chakra-ui/react";
import { ThemeProvider, AppendChildPortal, usePrevious, TAGGING_THRESHOLD, useUserTokensWithMeta, truthy } from "wumbo-common";
import { useProfile } from "../../utils/twitterSpotter";
import { MainButton } from "../MainButton";
import { ClaimButton } from "../ClaimButton";
import { Spinner, useBufferFromUrl, getBufferFromUrl } from "wumbo-common";
import compareImages from "resemblejs/compareImages";
import { useWallet } from "@solana/wallet-adapter-react";
import { ITokenWithMetaAndAccount } from "@strata-foundation/spl-token-collective";
import { useErrorHandler } from "@strata-foundation/react";
import { useAsync } from "react-async-hook";
import { useHistory } from "react-router-dom";
import { useDrawer } from "../../contexts/drawerContext";
import { tagNftPath } from "@/constants/routes";

async function imagesMatch(img1: Blob | undefined, img2Src: string): Promise<boolean> {
  const img2 = await getBufferFromUrl(img2Src);
  const mismatchPercent = +(
    await compareImages(img1, img2, { scaleToSameSize: true })
  ).misMatchPercentage;
  return mismatchPercent <= TAGGING_THRESHOLD
}


async function getTaggableNft(img1: Blob | undefined, tokens: ITokenWithMetaAndAccount[] | undefined): Promise<ITokenWithMetaAndAccount | undefined> {
  if (!img1 || !tokens) {
    return
  }

  return Promise.any(tokens.filter(token => token.mint?.decimals == 0).map(async token => {
    const isMatch = token.image && await imagesMatch(img1, token.image);
    if (isMatch) {
      return token;
    } else {
      throw "Not a match";
    }
  })).catch((e: any) => {
    console.error(e);
    return undefined;
  });
}

export const ProfileEnhancer = () => {
  const [triggerCount, setTriggerCount] = useState<number>(0);
  const profile = useProfile();
  const previousProfile = usePrevious(profile);
  const history = useHistory();
  const { adapter } = useWallet();

  const triggerRemount = useCallback(() => {
    setTriggerCount(triggerCount + 1);
  }, [triggerCount, setTriggerCount]);

  useEffect(() => {
    if (previousProfile && profile) {
      const [prevName, currName] = [previousProfile.name, profile.name];
      if (prevName !== currName) {
        triggerRemount();
      }
    }
  }, [previousProfile, profile, triggerRemount]);
  const { result: img1, error: bufferError } = useBufferFromUrl(profile?.avatar);
  const { data: tokens, error, loading: loadingTokens } = useUserTokensWithMeta(adapter?.publicKey || undefined);
  const { handleErrors } = useErrorHandler();
  const { result: pfpMatch, error: pfpMatcherError, loading } = useAsync(getTaggableNft, [img1, tokens]);
  handleErrors(error, bufferError, pfpMatcherError);
  const { toggleDrawer } = useDrawer();

  if (profile) {
    const buttonEl = profile.buttonTarget ? (
      profile.type == "mine" ? (
        <ClaimButton
          buttonTarget={profile.buttonTarget}
          creatorName={profile.name}
          creatorImg={profile.avatar || ""}
          btnProps={{
            size: "md",
            borderRadius: "full",
          }}
          spinnerProps={{
            size: "lg",
          }}
        />
      ) : (
        <MainButton
          buttonTarget={profile.buttonTarget}
          creatorName={profile.name}
          creatorImg={profile.avatar || ""}
          btnProps={{
            size: "md",
            borderRadius: "full",
          }}
          spinnerProps={{
            size: "lg",
          }}
        />
      )
    ) : null;

    if (buttonEl) {
      return (
        <Fragment key={triggerCount}>
          <AppendChildPortal container={profile.buttonTarget as Element}>
            <ReactShadow.div>
              <ThemeProvider>
                <HStack
                  d="flex"
                  justifyContent="center"
                  justifySelf="start"
                  marginLeft="4px"
                  marginBottom="11px"
                  spacing={1}
                >
                  {buttonEl}
                  { (loading || loadingTokens) &&
                    <Spinner />
                  }
                  { pfpMatch &&
                    <Button
                      fontFamily="body"
                      colorScheme="indigo"
                      variant="outline"
                      borderRadius="full"
                      size="md"
                      onClick={() => {
                        history.push(tagNftPath(pfpMatch.account!.mint))
                        toggleDrawer({
                          isOpen: true,
                          creator: { name: profile.name, img: profile.avatar },
                        });
                      }}
                    >
                      { pfpMatch && "Verify PFP" }
                    </Button>
                  }
                </HStack>
              </ThemeProvider>
            </ReactShadow.div>
          </AppendChildPortal>
        </Fragment>
      );
    }
  }

  return null;
};
