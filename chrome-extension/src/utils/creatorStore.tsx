import {Account, Connection, PublicKey} from "@solana/web3.js";
import {getHashedName, getNameAccountKey} from "@bonfida/spl-name-service";
import {
  KEYPAIR,
  SOLCLOUT_INSTANCE_KEY,
  SOLCLOUT_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TWITTER_ROOT_PARENT_REGISTRY_KEY
} from "../globals";
import {SolcloutCreator} from "../solclout-api/state";
import {createSolcloutCreator} from "../solclout-api/bindings";

class AsyncCache<In, Out> {
  private cache: Map<In, Out> = new Map<In, Out>()

  async getOrElseUpdate(key: In, update: () => Promise<Out>): Promise<Out> {
    const existingEntry = this.cache.get(name)
    if (existingEntry) {
      return Promise.resolve(existingEntry)
    }

    const output = await update()
    this.cache.set(key, output)

    return output
  }
}

export default class CreatorStore {
  solanaConnection: Connection

  private creatorCache: AsyncCache<string, SolcloutCreator> = new AsyncCache()
  private keyCache: AsyncCache<string, PublicKey> = new AsyncCache()

  constructor(solanaConnection: Connection) {
    this.solanaConnection = solanaConnection
  }

  create(name: string): Promise<void> {
    return createSolcloutCreator(this.solanaConnection, {
      programId: SOLCLOUT_PROGRAM_ID,
      tokenProgramId: TOKEN_PROGRAM_ID,
      payer: new Account(KEYPAIR.secretKey),
      solcloutInstance: SOLCLOUT_INSTANCE_KEY,
      name,
      founderRewardsPercentage: 5.5,
      nameParent: TWITTER_ROOT_PARENT_REGISTRY_KEY
    })
  }

  getCreatorKey(name: string): Promise<PublicKey> {
    return this.keyCache.getOrElseUpdate(name, async () => {
      const hashedName = await getHashedName(name)
      const twitterHandleRegistryKey = await getNameAccountKey(hashedName, undefined, TWITTER_ROOT_PARENT_REGISTRY_KEY)
      const [solcloutCreatorKey, _] = await PublicKey.findProgramAddress([SOLCLOUT_INSTANCE_KEY.toBuffer(), twitterHandleRegistryKey.toBuffer()], SOLCLOUT_PROGRAM_ID)

      return solcloutCreatorKey
    })
  }

  getCreator(name: string): Promise<SolcloutCreator> {
    return this.creatorCache.getOrElseUpdate(name, async () => {
      const key = await this.getCreatorKey(name)
      return SolcloutCreator.retrieve(this.solanaConnection, key)
    })
  }
}