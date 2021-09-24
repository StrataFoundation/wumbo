import { PublicKey } from "@solana/web3.js"
import * as anchor from "@wum.bo/anchor";
import { SplTokenBonding, SplTokenBondingIDL, SplTokenBondingIDLJson } from "@wum.bo/spl-token-bonding";
import { SplWumbo, SplWumboIDL, SplWumboIDLJson } from "@wum.bo/spl-wumbo";
import { SplTokenStaking, SplTokenStakingIDL, SplTokenStakingIDLJson } from "@wum.bo/spl-token-staking";
import { SplTokenAccountSplit, SplTokenAccountSplitIDL, SplTokenAccountSplitIDLJson } from "@wum.bo/spl-token-account-split";

export const splTokenBondingProgramId = new PublicKey("TBondz6ZwSM5fs4v2GpnVBMuwoncPkFLFR9S422ghhN")
export const splWumboProgramId = new PublicKey("WumbodN8t7wcDPCY2nGszs4x6HRtL5mJcTR519Qr6m7")
export const splTokenAccountSplitProgramId = new PublicKey("Sp1it1Djn2NmQvXLPnGM4zAXArxuchvSdytNt5n76Hm")
export const splTokenStakingProgramId = new PublicKey("TStakXwvzEZiK6PSNpXuNx6wEsKc93NtSaMxmcqG6qP")

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
