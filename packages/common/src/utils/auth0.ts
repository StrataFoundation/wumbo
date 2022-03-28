import { WebAuth, AuthOptions } from "auth0-js";
import { APP_URL, SITE_URL } from "../constants";

export const auth0Options: AuthOptions = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || "wumbo.us.auth0.com",
  maxAge: 1,
  clientID:
    process.env.REACT_APP_AUTH0_CLIENT_ID || "GPsjYroOyNKWCScIk2woGZi4kBTGDDTW",
};

export const auth0 = new WebAuth(auth0Options);

function makeId(length: number): string {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function useClaimLink({
  handle,
  newTab = false,
  step = 3,
}: {
  handle: string;
  newTab?: boolean;
  extension?: boolean;
  step?: number;
}): { redirectUri: string; claim: () => Window | null } {
  const redirectUri = `${APP_URL}/claim?step=${step}&handle=${handle}`;
  const claim = () => {
    const state = makeId(6);

    const auth0Url = auth0.client.buildAuthorizeUrl({
      scope: "openid profile",
      redirectUri,
      responseType: "code",
      state,
    });

    if (newTab) {
      return window.open(auth0Url);
    } else {
      auth0.authorize({
        scope: "openid profile",
        redirectUri,
        responseType: "code",
        state,
        prompt: "login",
      });
    }

    return window;
  };

  return {
    redirectUri,
    claim,
  };
}
