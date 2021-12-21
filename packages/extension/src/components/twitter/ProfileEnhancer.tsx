import React, { Fragment, useEffect, useState, useCallback } from "react";
import ReactShadow from "react-shadow/emotion";
import { Box } from "@chakra-ui/react";
import { ThemeProvider, AppendChildPortal, usePrevious } from "wumbo-common";
import { useProfile } from "../../utils/twitterSpotter";
import { MainButton } from "../MainButton";
import { ClaimButton } from "../ClaimButton";

export const ProfileEnhancer = () => {
  const [triggerCount, setTriggerCount] = useState<number>(0);
  const profile = useProfile();
  const previousProfile = usePrevious(profile);

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
                <Box
                  d="flex"
                  justifyContent="center"
                  justifySelf="start"
                  marginLeft="4px"
                  marginBottom="11px"
                >
                  {buttonEl}
                </Box>
              </ThemeProvider>
            </ReactShadow.div>
          </AppendChildPortal>
        </Fragment>
      );
    }
  }

  return null;
};
