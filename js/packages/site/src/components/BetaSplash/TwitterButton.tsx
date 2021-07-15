import React from 'react';
import { auth0, auth0Options, Spinner } from "wumbo-common";
import { Button } from "wumbo-common";
import twitterLogo from "../../assets/images/social/twitter-white@3x.png";

export default React.memo(({ loading, onClick, children }: { loading?: boolean, onClick: () => void, children: any }) => {
  return <Button
    color="twitterBlue"
    className="flex items-center"
    onClick={onClick}
    disabled={loading}
      // window.location.href = auth0.client.buildAuthorizeUrl({
      //   ...auth0Options,
      //   scope: 'openid profile',
      //   redirectUri: "https://wum.bo/claim",
      //   responseType: 'code',
      //   state: 'foo',
      // })
    // }}
  >
    { loading ? <Spinner size="xs" /> : <img className="mr-2" src={twitterLogo} alt="twitter" width="20" />} {children}
  </Button>
})