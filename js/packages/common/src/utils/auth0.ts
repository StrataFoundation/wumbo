import {WebAuth} from "auth0-js";

export const auth0Options = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || 'wumbo.us.auth0.com',
  clientID: process.env.REACT_APP_AUTH0_CLIENT_ID || 'GPsjYroOyNKWCScIk2woGZi4kBTGDDTW',
}
export const auth0 = new WebAuth(auth0Options)