import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { getMultipleAccounts } from './getMultipleAccounts';
import { EventEmitter } from './eventEmitter';
import { Commitment } from '@solana/web3.js';

export const DEFAULT_CHUNK_SIZE = 99;
export const DEFAULT_DELAY = 50;

export interface ParsedAccountBase {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
  info: unknown;
}

export type AccountParser = (
  pubkey: PublicKey,
  data: AccountInfo<Buffer>,
) => ParsedAccountBase | undefined;

export interface ParsedAccount<T> extends ParsedAccountBase {
  info: T;
}

export class Cache {
  chunkSize: number;
  delay: number;
  commitment: Commitment;
  genericCache = new Map<string, ParsedAccountBase>();
  keyToAccountParser = new Map<string, AccountParser>();
  timeout: NodeJS.Timeout | null = null
  currentBatch = new Set<string>();
  pendingCallbacks = new Map<string, ((info: AccountInfo<Buffer> | null, err: Error | null) => void)>();
  pendingCalls = new Map<string, Promise<ParsedAccountBase>>();;
  emitter = new EventEmitter();

  constructor({ chunkSize = DEFAULT_CHUNK_SIZE, delay = DEFAULT_DELAY, commitment }: { chunkSize?: number, delay?: number, commitment: Commitment }) {
    this.chunkSize = chunkSize;
    this.delay = delay;
    this.commitment = commitment;
  }

  async fetchBatch(connection: Connection) {
    const currentBatch = this.currentBatch;
    this.currentBatch = new Set(); // Erase current batch from state, so we can fetch multiple at a time
    try {
      const { keys, array } = await getMultipleAccounts(connection, [...currentBatch], this.commitment)
      keys.forEach((key, index) => {
        this.pendingCallbacks.get(key)!(array[index], null)
        this.pendingCallbacks.delete(key);
      })
  
      return { keys, array };
    } catch(e) {
      currentBatch.forEach(key => this.pendingCallbacks.get(key)!(null, e));
      throw e;
    }
  }

  async addToBatch (connection: Connection, id: PublicKey): Promise<AccountInfo<Buffer>> {
    const idStr = id.toBase58();
    
    const promise = new Promise<AccountInfo<Buffer>>((resolve, reject) => {
      this.timeout && clearTimeout(this.timeout);
      this.pendingCallbacks.set(idStr, (info, err) => {
        if (err) {
          return reject(err)
        }

        resolve(info!)
      });
      this.currentBatch.add(idStr);
      
      if (this.currentBatch.size > DEFAULT_CHUNK_SIZE) {
        this.fetchBatch(connection)
      } else {
        this.timeout = setTimeout(() => this.fetchBatch(connection), this.delay)
      }
    });

    return promise;
  }

  async flush(connection: Connection) {
    this.timeout && clearTimeout(this.timeout);
    await this.fetchBatch(connection);
  }

  async query(
    connection: Connection,
    pubKey: string | PublicKey,
    parser?: AccountParser,
  ) {
    let id: PublicKey;
    if (typeof pubKey === 'string') {
      id = new PublicKey(pubKey);
    } else {
      id = pubKey;
    }

    const address = id.toBase58();

    let account = this.genericCache.get(address);
    if (account) {
      return account;
    }

    const existingQuery = this.pendingCalls.get(address);
    if (existingQuery) {
      return existingQuery;
    }


    // TODO: refactor to use multiple accounts query with flush like behavior
    const query = this.addToBatch(connection, id).then(data => {
      if (!data) {
        throw new Error('Account not found');
      }

      return this.add(id, data, parser);
    });
    this.pendingCalls.set(address, query as any);

    return query;
  }

  add(
    id: PublicKey | string,
    obj: AccountInfo<Buffer>,
    parser?: AccountParser,
    isActive?: boolean | undefined | ((parsed: any) => boolean),
  ) {
    const address = typeof id === 'string' ? id : id?.toBase58();
    const deserialize = parser ? parser : this.keyToAccountParser.get(address);
    if (!deserialize) {
      throw new Error(
        'Deserializer needs to be registered or passed as a parameter',
      );
    }

    this.registerParser(id, deserialize);
    this.pendingCalls.delete(address);
    const account = deserialize(new PublicKey(address), obj);
    if (!account) {
      return;
    }

    if (isActive === undefined) isActive = true;
    else if (isActive instanceof Function) isActive = isActive(account);

    const isNew = !this.genericCache.has(address);

    this.genericCache.set(address, account);
    this.emitter.raiseCacheUpdated(address, isNew, deserialize, isActive);
    return account;
  }

  get(pubKey: string | PublicKey) {
    let key: string;
    if (typeof pubKey !== 'string') {
      key = pubKey.toBase58();
    } else {
      key = pubKey;
    }

    return this.genericCache.get(key);
  }

  delete(pubKey: string | PublicKey) {
    let key: string;
    if (typeof pubKey !== 'string') {
      key = pubKey.toBase58();
    } else {
      key = pubKey;
    }

    if (this.genericCache.get(key)) {
      this.genericCache.delete(key);
      this.emitter.raiseCacheDeleted(key);
      return true;
    }
    return false;
  }

  byParser(parser: AccountParser) {
    const result: string[] = [];
    for (const id of this.keyToAccountParser.keys()) {
      if (this.keyToAccountParser.get(id) === parser) {
        result.push(id);
      }
    }

    return result;
  }

  registerParser(pubkey: PublicKey | string, parser: AccountParser) {
    if (pubkey) {
      const address = typeof pubkey === 'string' ? pubkey : pubkey?.toBase58();
      this.keyToAccountParser.set(address, parser);
    }

    return pubkey;
  }
}
