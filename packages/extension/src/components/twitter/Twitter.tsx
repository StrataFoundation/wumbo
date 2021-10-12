import React, { Fragment } from "react";
import { ProfileEnhancer } from "./ProfileEnhancer";
import { TweetsEnhancer } from "./TweetsEnhancer";
import { UserCellEnhancer } from "./UserCellEnhancer";

export const Twitter = () => (
  <Fragment>
    <ProfileEnhancer />
    <TweetsEnhancer />
    <UserCellEnhancer />
  </Fragment>
);
