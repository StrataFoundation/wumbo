import React from 'react';
import { auth0, auth0Options } from "wumbo-common";
import { Button } from "wumbo-common";
import twitterLogo from "../../assets/images/social/twitter-white@3x.png";

export default React.memo(() => {
  return <Button
    color="twitterBlue"
    className="flex items-center"
    onClick={() => {
      window.location.href = auth0.client.buildAuthorizeUrl({
        ...auth0Options,
        scope: 'openid profile',
        redirectUri: "https://wum.bo/claim",
        responseType: 'code',
        state: 'foo',
      })
    }}
  >
    <img className="mr-2" src={twitterLogo} alt="twitter" width="20" /> Beta Sign Up
  </Button>
})