import { PublicKey } from "@solana/web3.js"
import * as anchor from "@wum.bo/anchor";
import { SplTokenBonding, SplTokenBondingIDL, SplTokenBondingIDLJson } from "@wum.bo/spl-token-bonding";
import { SplWumbo, SplWumboIDL, SplWumboIDLJson } from "@wum.bo/spl-wumbo";
import { SplTokenStaking, SplTokenStakingIDL, SplTokenStakingIDLJson } from "@wum.bo/spl-token-staking";
import { SplTokenAccountSplit, SplTokenAccountSplitIDL, SplTokenAccountSplitIDLJson } from "@wum.bo/spl-token-account-split";

export const splTokenBondingProgramId = new PublicKey("CJMw4wALbZJswJCxLsYUj2ExGCaEgMAp8JSGjodbxAF4")
export const splWumboProgramId = new PublicKey("Bn6owcizWtLgeKcVyXVgUgTvbLezCVz9Q7oPdZu5bC1H")
export const splTokenAccountSplitProgramId = new PublicKey("5DbtwvnZnsAkRWc6q5u4FJ4NLc3cmALV637ybjP4wKzE")
export const splTokenStakingProgramId = new PublicKey("GEFM3nvcHypYtEZMxLrjuAUKwQjLuRcx1YaWXqa85WCm")

export type AnchorPrograms = {
  splTokenBondingProgram?: SplTokenBonding;
  splWumboProgram?: SplWumbo;
  splTokenStakingProgram?: SplTokenStaking;
  splTokenAccountSplitProgram?: SplTokenAccountSplit;
}
export function getPrograms(provider: anchor.Provider): AnchorPrograms {
  const splTokenBonding = new anchor.Program(SplTokenBondingIDLJson, splTokenBondingProgramId, provider) as anchor.Program<SplTokenBondingIDL>;
  const splWumbo = new anchor.Program(SplWumboIDLJson, splWumboProgramId, provider) as anchor.Program<SplWumboIDL>;
  const splTokenAccountSplit = new anchor.Program(SplTokenAccountSplitIDLJson, splTokenAccountSplitProgramId, provider) as anchor.Program<SplTokenAccountSplitIDL>;
  const splTokenStaking = new anchor.Program(SplTokenStakingIDLJson, splTokenStakingProgramId, provider) as anchor.Program<SplTokenStakingIDL>;
  
  const splTokenBondingProgram = new SplTokenBonding(splTokenBonding);
  const splTokenStakingProgram = new SplTokenStaking(splTokenStaking);
  const splTokenAccountSplitProgram = new SplTokenAccountSplit(splTokenAccountSplit, splTokenStakingProgram);
  const splWumboProgram = new SplWumbo({
    program: splWumbo,
    splTokenBondingProgram,
    splTokenAccountSplitProgram,
    splTokenStakingProgram
  });

  return {
    splTokenBondingProgram,
    splWumboProgram,
    splTokenAccountSplitProgram,
    splTokenStakingProgram
  }
}
