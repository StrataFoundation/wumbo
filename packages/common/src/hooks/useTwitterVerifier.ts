import { useAsync } from "react-async-hook";
import { getTwitterVerifier } from "../utils";
import { PublicKey } from "@solana/web3.js";

export function useTwitterVerifier(): PublicKey | undefined {
  const { result } = useAsync(getTwitterVerifier, []);
  return result;
}
