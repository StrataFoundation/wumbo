import React from "react";
import ReactShadow from "react-shadow/emotion";
import { ThemeProvider, CSSReset, Box } from "@chakra-ui/react";
import { theme } from "@/theme";

import { AppendChildPortal } from "wumbo-common";
import { useProfile } from "../../utils/twitterSpotter";
import { MainButton } from "../MainButton";

export const ProfileEnhancer = () => {
  const profile = useProfile();

  if (profile) {
    const buttonEl = profile.buttonTarget ? (
      <MainButton
        creatorName={profile.name}
        creatorImg={profile.avatar || ""}
        btnProps={{
          size: "md",
          borderRadius: "full",
        }}
        spinnerProps={{
          size: "md",
        }}
      />
    ) : null;

    if (buttonEl) {
      return (
        <AppendChildPortal container={profile.buttonTarget as Element}>
          <ReactShadow.div>
            <ThemeProvider theme={theme}>
              <CSSReset />
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
