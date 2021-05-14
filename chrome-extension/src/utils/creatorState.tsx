import {useEffect, useState} from "react";
import {getHashedName, getNameAccountKey} from "@bonfida/spl-name-service";
import {SOLCLOUT_INSTANCE_KEY, SOLCLOUT_PROGRAM_ID, TWITTER_ROOT_PARENT_REGISTRY_KEY} from "../globals";
import {AccountInfo, PublicKey} from "@solana/web3.js";
import {SolcloutCreator} from "../solclout-api/state";
import {useConnection} from "@oyster/common/lib/contexts/connection"
import {useMint} from "./mintState";

export const useCreatorKey = (name: string): PublicKey | undefined => {
  const [key, setKey] = useState<PublicKey>()

  useEffect(() => {
    (async () => {
      const hashedName = await getHashedName(name)
      const twitterHandleRegistryKey = await getNameAccountKey(hashedName, undefined, TWITTER_ROOT_PARENT_REGISTRY_KEY)
      const [solcloutCreatorKey, _] = await PublicKey.findProgramAddress([SOLCLOUT_INSTANCE_KEY.toBuffer(), twitterHandleRegistryKey.toBuffer()], SOLCLOUT_PROGRAM_ID)

      setKey(solcloutCreatorKey)
    })()
  }, [name])

  return key
}

export const useCreator = (name: string): SolcloutCreator | undefined => {
  const key = useCreatorKey(name)
  const connection = useConnection()
  const [creator, setCreator] = useState<SolcloutCreator>()

  useEffect(() => {
    if (key) {
      const sub = connection.onAccountChange(
        key,
        (accountInfo: AccountInfo<Buffer>) => {
          setCreator(SolcloutCreator.fromAccount(key, accountInfo))
        },
        "singleGossip"
      );

      (async () => {
        const creator = await SolcloutCreator.retrieve(connection, key)
        creator && setCreator(creator)
      })()

      return () => {
        connection.removeAccountChangeListener(sub)
      }
    }
  }, [key])

  return creator
}

interface CreatorInfo {
  name: string,
  coinPrice: number
}
export const useCreatorInfo = (name: string): CreatorInfo | undefined => {
  const creator = useCreator(name)
  const mint = useMint(creator && creator.creatorToken)
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo>()

  useEffect(() => {
    if (mint) {
      const solcloutPrice = Math.pow(mint.supply.toNumber() / Math.pow(10, 9), 2) / 3000
      setCreatorInfo({
        name,
        coinPrice: solcloutPrice
      })
    }
  }, [mint])

  return creatorInfo
}