import {WebAuth} from "auth0-js";

export const auth0Options = {
  domain: 'wumbo.us.auth0.com',
  clientID: 'GPsjYroOyNKWCScIk2woGZi4kBTGDDTW',
}
export default new WebAuth(auth0Options)

const auth0 = new WebAuth(auth0Options)