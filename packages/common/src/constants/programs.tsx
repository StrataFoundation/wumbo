import { PublicKey } from "@solana/web3.js";
import * as anchor from "@wum.bo/anchor";
import { SplTokenBonding, SplTokenBondingIDL } from "@wum.bo/spl-token-bonding";
import { SplWumbo, SplWumboIDL, SplWumboIDLJson } from "@wum.bo/spl-wumbo";
import { SplTokenStaking, SplTokenStakingIDL } from "@wum.bo/spl-token-staking";
import {
  SplTokenAccountSplit,
  SplTokenAccountSplitIDL,
} from "@wum.bo/spl-token-account-split";

export const splTokenBondingProgramId = new PublicKey(
  "TBondz6ZwSM5fs4v2GpnVBMuwoncPkFLFR9S422ghhN"
);
export const splWumboProgramId = new PublicKey(
  "WumbodN8t7wcDPCY2nGszs4x6HRtL5mJcTR519Qr6m7"
);
export const splTokenAccountSplitProgramId = new PublicKey(
  "Sp1it1Djn2NmQvXLPnGM4zAXArxuchvSdytNt5n76Hm"
);
export const splTokenStakingProgramId = new PublicKey(
  "TStakXwvzEZiK6PSNpXuNx6wEsKc93NtSaMxmcqG6qP"
);

export type AnchorPrograms = {
  splTokenBondingProgram?: SplTokenBonding;
  splWumboProgram?: SplWumbo;
  splTokenStakingProgram?: SplTokenStaking;
  splTokenAccountSplitProgram?: SplTokenAccountSplit;
};
export async function getPrograms(
  provider?: anchor.Provider
): Promise<AnchorPrograms> {
  if (!provider) return {};

  const SplTokenBondingIDLJson = await anchor.Program.fetchIdl(
    splTokenBondingProgramId,
    provider
  );
  const SplWumboIDLJson = await anchor.Program.fetchIdl(
    splWumboProgramId,
    provider
  );

  const splTokenBonding = new anchor.Program(
    SplTokenBondingIDLJson!,
    splTokenBondingProgramId,
    provider
  ) as anchor.Program<SplTokenBondingIDL>;
  const splWumbo = new anchor.Program(
    SplWumboIDLJson!,
    splWumboProgramId,
    provider
  ) as anchor.Program<SplWumboIDL>;

  // const SplTokenStakingIDLJson = await anchor.Program.fetchIdl(splTokenStakingProgramId, provider);
  // const SplTokenAccountSplitIDLJson = await anchor.Program.fetchIdl(splTokenAccountSplitProgramId, provider);
  // const splTokenAccountSplit = new anchor.Program(SplTokenAccountSplitIDLJson!, splTokenAccountSplitProgramId, provider) as anchor.Program<SplTokenAccountSplitIDL>;
  // const splTokenStaking = new anchor.Program(SplTokenStakingIDLJson!, splTokenStakingProgramId, provider) as anchor.Program<SplTokenStakingIDL>;
  // Uncomment above when we release the others
  const splTokenAccountSplit = {} as any;
  const splTokenStaking = {} as any;

  const splTokenBondingProgram = new SplTokenBonding(provider, splTokenBonding);
  const splTokenStakingProgram = new SplTokenStaking(provider, splTokenStaking);
  const splTokenAccountSplitProgram = new SplTokenAccountSplit(
    provider,
    splTokenAccountSplit,
    splTokenStakingProgram
  );
  const splWumboProgram = new SplWumbo({
    provider,
    program: splWumbo,
    splTokenBondingProgram,
    splTokenAccountSplitProgram,
    splTokenStakingProgram,
  });

  return {
    splTokenBondingProgram,
    splWumboProgram,
    splTokenAccountSplitProgram,
    splTokenStakingProgram,
  };
}
