import { WebAuth } from "auth0-js";
import { useLocalStorageState } from "@oyster/common";

export const auth0Options = {
  // domain: process.env.REACT_APP_AUTH0_DOMAIN || 'wumbo.us.auth0.com',
  // clientID: process.env.REACT_APP_AUTH0_CLIENT_ID || 'GPsjYroOyNKWCScIk2woGZi4kBTGDDTW',
  domain: process.env.REACT_APP_AUTH0_DOMAIN || "dev-kf1b949a.jp.auth0.com",
  clientID:
    process.env.REACT_APP_AUTH0_CLIENT_ID || "QXGtiTg10PLDEkmoSPfCx3UqReu2K3sy",
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
export function useClaimLink({ handle, newTab = false}: { handle: string, newTab?: boolean }): { redirectUri: string,  claim: () => Window | null } {
  const setAuth0State = useLocalStorageState("auth0-state")[1];
  const redirectUri = `https://wum.bo/claim?name=${handle}`;
  const claim = () => {
    const state = makeId(6);
  
    const auth0Url = auth0.client.buildAuthorizeUrl({
      ...auth0Options,
      scope: "openid profile",
      redirectUri,
      responseType: "code",
      state,
    });
    setAuth0State(state);

    return window.open(auth0Url, newTab ? '_blank' : undefined)
  }

  return {
    redirectUri,
    claim
  }
}
