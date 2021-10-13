import { PublicKey } from "@solana/web3.js";
import { Coder } from "@wum.bo/anchor";
import { WumboV0, TokenRefV0, SplWumboIDLJson } from "@wum.bo/spl-wumbo";
import { TypedAccountParser } from "../account";

const wumboCoder = new Coder(SplWumboIDLJson);
export interface ITokenRef extends TokenRefV0 {
  publicKey: PublicKey;
}
export const TokenRef: TypedAccountParser<ITokenRef> = (pubkey, account) => {
  const coded = wumboCoder.accounts.decode<TokenRefV0>(
    "TokenRefV0",
    account.data
  );

  return {
    ...coded,
    publicKey: pubkey,
    isClaimed: coded.isClaimed || !!coded.owner, // TODO: Remove this or after beta, there was a bug in the smart contract
  };
};

export const WumboInstance: TypedAccountParser<
  WumboV0 & { publicKey: PublicKey }
> = (pubkey, account) => {
  const coded = wumboCoder.accounts.decode<WumboV0>("WumboV0", account.data);
  return {
    ...coded,
    publicKey: pubkey,
  };
};
