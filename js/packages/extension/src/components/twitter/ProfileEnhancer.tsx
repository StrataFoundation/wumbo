import React from "react";
import ReactShadow from "react-shadow/emotion";
import { Box } from "@chakra-ui/react";
import { ThemeProvider, AppendChildPortal } from "wumbo-common";
import { useProfile } from "../../utils/twitterSpotter";
import { MainButton } from "../MainButton";
import { ClaimButton } from "../ClaimButton";

export const ProfileEnhancer = () => {
  const profile = useProfile();
  console.log(profile);

  if (profile) {
    const buttonEl = profile.buttonTarget ? (
      profile.type == "mine" ?
        <ClaimButton
          creatorName={profile.name}
          creatorImg={profile.avatar || ""}
          btnProps={{
            size: "md",
            borderRadius: "full",
          }}
          spinnerProps={{
            size: "lg",
          }}
        /> :
        <MainButton
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
    ) : null;

    if (buttonEl) {
      return (
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
      );
    }
  }

  return null;
};
