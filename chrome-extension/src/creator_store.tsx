import {Account, Connection, PublicKey} from "@solana/web3.js";
import {MintLayout, u64, MintInfo} from "@solana/spl-token"
import {getHashedName, getNameAccountKey} from "@bonfida/spl-name-service";
import {
  KEYPAIR,
  SOLCLOUT_INSTANCE_KEY,
  SOLCLOUT_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TWITTER_ROOT_PARENT_REGISTRY_KEY
} from "./globals";
import {SolcloutCreator} from "./solclout-api/state";
import {Token} from "@solana/spl-token";
import {createSolcloutCreator} from "./solclout-api/bindings";

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

  private worthCache: AsyncCache<string, number> = new AsyncCache()
  private keyCache: AsyncCache<string, PublicKey> = new AsyncCache()

  constructor(solanaConnection: Connection) {
    this.solanaConnection = solanaConnection
  }

  async getMintInfo(token: PublicKey): Promise<MintInfo> {
    const info = await this.solanaConnection.getAccountInfo(token);
    if (!info) {
      throw new Error("Invalid mint")
    }
    if (info.data.length != MintLayout.span) {
      throw new Error(`Invalid mint size`);
    }

    const data = Buffer.from(info.data);
    const mintInfo = MintLayout.decode(data);
    if (mintInfo.mintAuthorityOption === 0) {
      mintInfo.mintAuthority = null;
    } else {
      mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority);
    }

    mintInfo.supply = u64.fromBuffer(mintInfo.supply)

    return mintInfo
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
      const [solcloutCreatorKey, _] = await PublicKey.findProgramAddress([twitterHandleRegistryKey.toBuffer()], SOLCLOUT_PROGRAM_ID)

      return solcloutCreatorKey
    })
  }

  async getWorth(name: string): Promise<number> {
    return this.worthCache.getOrElseUpdate(name, async () => {
      const creatorKey = await this.getCreatorKey(name)
      const creator = await SolcloutCreator.retrieve(this.solanaConnection, creatorKey)
      const mintInfo = await this.getMintInfo(creator.creatorToken)

      const solcloutPrice = Math.pow(mintInfo.supply.toNumber(), 3) / (1000 * Math.pow(10, 3))
      return solcloutPrice
    })
  }
}