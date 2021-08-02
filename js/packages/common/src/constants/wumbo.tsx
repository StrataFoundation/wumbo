import { Wumbo } from "spl-wumbo";
import { getTld } from "../utils";
import { WUMBO_PROGRAM_ID, WUMBO_INSTANCE_KEY } from "./globals"

let wumbo: Wumbo;
export async function getWumbo(): Promise<Wumbo> {
  if (!wumbo) {
    wumbo = new Wumbo({
      splWumboProgramId: WUMBO_PROGRAM_ID,
      wumboInstanceId: WUMBO_INSTANCE_KEY,
      twitterTld: await getTld()
    })
  }
  return wumbo
}