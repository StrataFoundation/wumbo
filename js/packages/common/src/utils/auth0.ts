import { WebAuth } from "auth0-js";

export const auth0Options = {
  // domain: process.env.REACT_APP_AUTH0_DOMAIN || 'wumbo.us.auth0.com',
  // clientID: process.env.REACT_APP_AUTH0_CLIENT_ID || 'GPsjYroOyNKWCScIk2woGZi4kBTGDDTW',
  domain: process.env.REACT_APP_AUTH0_DOMAIN || "dev-kf1b949a.jp.auth0.com",
  clientID:
    process.env.REACT_APP_AUTH0_CLIENT_ID || "QXGtiTg10PLDEkmoSPfCx3UqReu2K3sy",
};
export const auth0 = new WebAuth(auth0Options);
