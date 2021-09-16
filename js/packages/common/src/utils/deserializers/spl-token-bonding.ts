import { PublicKey } from "@solana/web3.js";
import { Coder } from "@wum.bo/anchor";
import { CurveV0, TokenBondingV0, SplTokenBondingIDLJson } from "@wum.bo/spl-token-bonding";
import { TypedAccountParser } from "../account";

export interface ITokenBonding extends TokenBondingV0 {
  publicKey: PublicKey;
}
const tokenBondingCoder = new Coder(SplTokenBondingIDLJson);
export const TokenBonding: TypedAccountParser<ITokenBonding> = (pubkey, account) => {
  const coded = tokenBondingCoder.accounts.decode<TokenBondingV0>("TokenBondingV0", account.data);

  return {
    ...coded,
    publicKey: pubkey
  };
}

export interface ICurve extends CurveV0 {
  publicKey: PublicKey;
}
export const Curve: TypedAccountParser<ICurve> = (pubkey, account) => {
  const coded = tokenBondingCoder.accounts.decode<CurveV0>("CurveV0", account.data);
  
  return {
    ...coded,
    publicKey: pubkey
  };
}
