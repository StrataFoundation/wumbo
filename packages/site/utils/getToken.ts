import { Base64 } from "js-base64";
import axios from "axios";

export async function getToken(): Promise<string> {
  if (process.env.NEXT_PUBLIC_ISSUER) {
    const token = Base64.encode(
      `${process.env.NEXT_PUBLIC_CLIENT_ID}:${process.env.NEXT_PUBLIC_CLIENT_SECRET}`
    );
    const { access_token } = (
      await axios.post(
        `${process.env.NEXT_PUBLIC_ISSUER}/token`,
        "grant_type=client_credentials",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${token}`,
          },
        }
      )
    ).data;
    return access_token;
  }

  return "";
}
