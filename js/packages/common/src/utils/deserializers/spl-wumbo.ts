import { PublicKey } from "@solana/web3.js";
import { Coder } from "@wum.bo/anchor";
import { Wumbo, TokenRefV0, SplWumboIDLJson } from "@wum.bo/spl-wumbo";
import { TypedAccountParser } from "../account";

const wumboCoder = new Coder(SplWumboIDLJson);
export interface ITokenRef extends TokenRefV0 {
  publicKey: PublicKey
}
export const TokenRef: TypedAccountParser<ITokenRef> = (pubkey, account) => {
  const coded = wumboCoder.accounts.decode<TokenRefV0>("TokenRefV0", account.data);
  
  return {
    ...coded,
    publicKey: pubkey
  };
}

export const WumboInstance: TypedAccountParser<Wumbo & { publicKey: PublicKey }> = (pubkey, account) => {
  const coded = wumboCoder.accounts.decode<Wumbo>("Wumbo", account.data);
  return {
    ...coded,
    publicKey: pubkey
  };
}

