import { useAsync } from "react-async-hook";
import { PublicKey } from "@solana/web3.js";
import { getTwitterTld } from "@/utils";

export function useTwitterTld(): PublicKey | undefined {
  const { result } = useAsync(getTwitterTld, []);
  return result;
}
