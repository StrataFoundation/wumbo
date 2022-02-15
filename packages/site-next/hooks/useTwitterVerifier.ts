import { useAsync } from "react-async-hook";
import { PublicKey } from "@solana/web3.js";
import { getTwitterVerifier } from "@/utils";

export function useTwitterVerifier(): PublicKey | undefined {
  const { result } = useAsync(getTwitterVerifier, []);
  return result;
}
