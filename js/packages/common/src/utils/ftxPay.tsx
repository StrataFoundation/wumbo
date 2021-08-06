import { useWallet } from "./wallet";

export function useFtxPayLink(): string {
  const { wallet } = useWallet();

  return `https://ftx.com/pay/request?coin=SOL&address=${wallet?.publicKey?.toBase58()}&tag=&wallet=sol&memoIsRequired=false&memo=&fixedWidth=true`;
}