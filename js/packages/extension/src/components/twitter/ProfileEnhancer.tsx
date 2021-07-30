import React from "react";
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
          size: "lg",
          rounded: true,
        }}
        spinnerProps={{
          size: "md",
        }}
      />
    ) : null;

    if (buttonEl) {
      return (
        <AppendChildPortal container={profile.buttonTarget as Element}>
          <div className="flex justify-center self-start ml-2 mb-3">
            {buttonEl}
          </div>
        </AppendChildPortal>
      );
    }
  }

  return null;
};
