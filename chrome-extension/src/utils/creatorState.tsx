import { useEffect, useState } from "react";
import { getHashedName, getNameAccountKey } from "@bonfida/spl-name-service";
import {
  SOLCLOUT_INSTANCE_KEY,
  SOLCLOUT_PROGRAM_ID,
  TWITTER_ROOT_PARENT_REGISTRY_KEY,
} from "../constants/globals";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import { SolcloutCreator } from "../solclout-api/state";
import { useConnection } from "@oyster/common/lib/contexts/connection";
import { useMint } from "./mintState";
import { useSolcloutUsdPrice } from "./pricing";
import { MintInfo } from "@solana/spl-token";

export interface ReactiveAccountState {
  account?: AccountInfo<Buffer>;
  loading: boolean;
}
export function useReactiveAccount(
  publicKey?: PublicKey
): ReactiveAccountState {
  const [state, setState] = useState<ReactiveAccountState>({ loading: true });
  const connection = useConnection();

  useEffect(() => {
    if (publicKey) {
      const sub = connection.onAccountChange(
        publicKey,
        (accountInfo: AccountInfo<Buffer>) => {
          setState({ account: accountInfo, loading: false });
        },
        "singleGossip"
      );

      (async () => {
        if (publicKey) {
          const account = await connection.getAccountInfo(
            publicKey,
            "singleGossip"
          );
          if (account) {
            setState({ account, loading: false });
          } else {
            setState({ loading: false });
          }
        }
      })();

      return () => {
        connection.removeAccountChangeListener(sub);
      };
    }
  }, [publicKey]);

  if (!publicKey) {
    return { loading: false };
  }

  return state;
}

export const useCreatorKey = (name: string): PublicKey | undefined => {
  const [key, setKey] = useState<PublicKey>();

  useEffect(() => {
    (async () => {
      const hashedName = await getHashedName(name);
      const twitterHandleRegistryKey = await getNameAccountKey(
        hashedName,
        undefined,
        TWITTER_ROOT_PARENT_REGISTRY_KEY
      );
      const [solcloutCreatorKey, _] = await PublicKey.findProgramAddress(
        [SOLCLOUT_INSTANCE_KEY.toBuffer(), twitterHandleRegistryKey.toBuffer()],
        SOLCLOUT_PROGRAM_ID
      );

      setKey(solcloutCreatorKey);
    })();
  }, [name]);

  return key;
};

interface CreatorState {
  creator?: SolcloutCreator;
  loading: boolean;
}

export const useCreator = (name: string): CreatorState => {
  const key = useCreatorKey(name);
  const connection = useConnection();
  const [creator, setCreator] = useState<CreatorState>({ loading: true });

  useEffect(() => {
    if (key) {
      const sub = connection.onAccountChange(
        key,
        (accountInfo: AccountInfo<Buffer>) => {
          setCreator({
            creator: SolcloutCreator.fromAccount(key, accountInfo),
            loading: false,
          });
        },
        "singleGossip"
      );

      (async () => {
        const creator = await SolcloutCreator.retrieve(connection, key);
        if (creator) {
          setCreator({ creator: creator, loading: false });
        } else {
          setCreator({ loading: false });
        }
      })();

      return () => {
        connection.removeAccountChangeListener(sub);
      };
    }
  }, [key]);

  return creator;
};

interface CreatorInfo {
  name: string;
  coinPriceUsd: number;
  coinPrice: number;
  creator: SolcloutCreator;
  mint: MintInfo;
}
export interface CreatorInfoState {
  creatorInfo?: CreatorInfo;
  loading: boolean;
}
export const useCreatorInfo = (name: string): CreatorInfoState => {
  const { creator, loading } = useCreator(name);
  const mint = useMint(creator && creator.creatorToken);
  const solcloutUsdPrice = useSolcloutUsdPrice();
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfoState>({
    loading: true,
  });

  useEffect(() => {
    if (mint && creator) {
      const solcloutPrice =
        Math.pow(mint.supply.toNumber() / Math.pow(10, 9), 2) / 3000;
      setCreatorInfo({
        creatorInfo: {
          name,
          creator,
          mint,
          coinPrice: solcloutPrice,
          coinPriceUsd: solcloutPrice * (solcloutUsdPrice || 0),
        },
        loading: false,
      });
    } else if (!loading) {
      setCreatorInfo({ loading: false });
    }
  }, [mint, creator, loading]);

  return creatorInfo;
};
