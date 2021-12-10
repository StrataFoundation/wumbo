import { useAsync } from "react-async-hook";
import { getTwitterTld } from "../utils";
import { PublicKey } from "@solana/web3.js";

export function useTwitterTld(): PublicKey | undefined {
  const { result } = useAsync(getTwitterTld, []);
  return result;
}
