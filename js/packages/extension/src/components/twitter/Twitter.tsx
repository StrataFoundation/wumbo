import React, { Fragment } from "react";
import { ProfileEnhancer } from "./ProfileEnhancer";
import { TweetsEnhancer } from "./TweetsEnhancer";
import { UserCellEnhancer } from "./UserCellEnhancer";

export const Twitter = () => {
  if (location.host !== "twitter.com") return null;

  return (
    <Fragment>
      <ProfileEnhancer />
      <TweetsEnhancer />
      <UserCellEnhancer />
    </Fragment>
  );
};
