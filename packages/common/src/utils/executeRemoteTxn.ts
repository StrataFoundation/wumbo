import { sendAndConfirmRawTransaction, Transaction } from "@solana/web3.js";
import axios from "axios";
import { Provider } from "@project-serum/common";
import { ProgramError } from "@strata-foundation/spl-utils";

async function promiseAllInOrder<T>(
  it: (() => Promise<T>)[]
): Promise<Iterable<T>> {
  let ret: T[] = [];
  for (const i of it) {
    ret.push(await i());
  }

  return ret;
}

/**
 * Execute transactions from a remote server (either single or multiple transactions)
 * @param provider
 * @param url
 * @param body
 * @param errors
 * @returns
 */
export async function executeRemoteTxn(
  provider: Provider,
  url: string,
  body: any,
  errors: Map<number, string> = new Map()
): Promise<string[]> {
  try {
    const resp = await axios.post(url, body, {
      responseType: "json",
    });
    const rawTxns = Array.isArray(resp.data) ? resp.data : [resp.data];
    const txns = rawTxns.map((t) => Transaction.from(t.data));
    const needToSign = txns.filter((tx) =>
      tx.signatures.some((sig) =>
        sig.publicKey.equals(provider.wallet.publicKey)
      )
    );
    const signedTxns = await provider.wallet.signAllTransactions(needToSign);
    const txnsToExec = txns.map((txn, idx) => {
      const index = needToSign.indexOf(txn);
      if (index >= 0) {
        return signedTxns[index].serialize();
      }

      return Buffer.from(rawTxns[idx]);
    });

    return [
      ...(await promiseAllInOrder(
        txnsToExec.map((txn) => async () => {
          const txid = await provider.connection.sendRawTransaction(txn, {
            skipPreflight: true,
          });
          const result = await provider.connection.confirmTransaction(
            txid,
            "confirmed"
          );
          if (result.value.err) {
            const tx = await provider.connection.getTransaction(txid, {
              commitment: "confirmed",
            });
            console.error(tx?.meta?.logMessages?.join("\n"));
            throw result.value.err;
          }
          return txid;
        })
      )),
    ];
  } catch (e: any) {
    if (e.response?.data?.message) {
      throw new Error(e.response.data.message);
    }
    const wrappedE = ProgramError.parse(e, errors);
    throw wrappedE == null ? e : wrappedE;
  }
}
