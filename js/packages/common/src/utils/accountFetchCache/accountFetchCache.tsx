import { AccountInfo, Connection, PublicKey, SendOptions, Signer, Transaction, TransactionInstruction } from '@solana/web3.js';
import { getMultipleAccounts } from './getMultipleAccounts';
import { EventEmitter } from './eventEmitter';
import { Commitment } from '@solana/web3.js';

export const DEFAULT_CHUNK_SIZE = 99;
export const DEFAULT_DELAY = 50;

export interface ParsedAccountBase<T> {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
  info?: T;
}

export type AccountParser<T> = (
  pubkey: PublicKey,
  data: AccountInfo<Buffer>,
) => ParsedAccountBase<T> | undefined;

export class AccountFetchCache {
  connection: Connection;
  chunkSize: number;
  delay: number;
  commitment: Commitment;
  accountChangeListeners = new Map<string, number>();
  statics = new Set<string>();
  missingAcccounts = new Map<string, AccountParser<unknown> | undefined>();
  genericCache = new Map<string, ParsedAccountBase<unknown> | null>();
  keyToAccountParser = new Map<string, AccountParser<unknown>>();
  timeout: NodeJS.Timeout | null = null
  currentBatch = new Set<string>();
  pendingCallbacks = new Map<string, ((info: AccountInfo<Buffer> | null, err: Error | null) => void)>();
  pendingCalls = new Map<string, Promise<ParsedAccountBase<unknown>>>();;
  emitter = new EventEmitter();

  missingInterval: NodeJS.Timeout

  constructor({ connection, chunkSize = DEFAULT_CHUNK_SIZE, delay = DEFAULT_DELAY, commitment, missingRefetchDelay = 10000 }: { connection: Connection, chunkSize?: number, delay?: number, commitment: Commitment, missingRefetchDelay?: number }) {
    this.connection = connection;
    this.chunkSize = chunkSize;
    this.delay = delay;
    this.commitment = commitment;
    this.missingInterval = setInterval(this.fetchMissing.bind(this), missingRefetchDelay);

    const oldSendTransaction = connection.sendTransaction.bind(connection);
    const oldSendRawTransaction = connection.sendRawTransaction.bind(connection);

    const self = this;
    connection.sendTransaction = async function overloadedSendTransaction(
      transaction: Transaction,
      signers: Array<Signer>,
      options?: SendOptions
    ) {
      const result = await oldSendTransaction(transaction, signers, options);
      self.requeryMissing(transaction.instructions)

      return result;
    }

    connection.sendRawTransaction = async function overloadedSendRawTransaction(
      rawTransaction: Buffer | Uint8Array | Array<number>,
      options?: SendOptions,
    ) {
      const result = await oldSendRawTransaction(rawTransaction, options);
      self.requeryMissing(Transaction.from(rawTransaction).instructions)

      return result;
    }
  }

  async requeryMissing(instructions: TransactionInstruction[]) {
    const writeableAccounts = instructions.flatMap(i => i.keys.filter(k => k.isWritable)).map(a => a.pubkey.toBase58());
    const affectedAccounts = writeableAccounts.filter(acct => this.missingAcccounts.has(acct));
    await Promise.all(affectedAccounts.map(async account => {
      const parser = this.missingAcccounts.get(account);
      const result = await this.addToBatch(new PublicKey(account))
      this.onAccountChange(new PublicKey(account), parser, result);
    }))
  }

  async fetchMissing() {
    try {
      await Promise.all([...this.missingAcccounts].map(([account, _]) => this.search(new PublicKey(account), this.missingAcccounts.get(account))))
    } catch(e) {
      // This happens in an interval, so just log errors
      console.error(e);
    }
  }

  close() {
    clearInterval(this.missingInterval);
  }

  async fetchBatch() {
    const currentBatch = this.currentBatch;
    this.currentBatch = new Set(); // Erase current batch from state, so we can fetch multiple at a time
    try {
      console.log(`Batching account fetch of ${currentBatch.size}`);
      const { keys, array } = await getMultipleAccounts(this.connection, [...currentBatch], this.commitment)
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

  async addToBatch (id: PublicKey): Promise<AccountInfo<Buffer>> {
    const idStr = id.toBase58();

    this.currentBatch.add(idStr);

    this.timeout != null && clearTimeout(this.timeout);
    if (this.currentBatch.size > DEFAULT_CHUNK_SIZE) {
      this.fetchBatch()
    } else {
      this.timeout = setTimeout(() => this.fetchBatch(), this.delay)
    }

    const promise = new Promise<AccountInfo<Buffer>>((resolve, reject) => {
      this.pendingCallbacks.set(idStr, (info, err) => {
        if (err) {
          return reject(err)
        }

        resolve(info!)
      });
    });

    return promise;
  }

  async flush() {
    this.timeout && clearTimeout(this.timeout);
    await this.fetchBatch();
  }

  // The same as query, except swallows errors and returns undefined.
  async search<T>(
    pubKey: string | PublicKey,
    parser: AccountParser<T> = (pubkey, account) => ({
      pubkey, account
    }),
    isStatic: Boolean = false // optimization, set if the data will never change
  ): Promise<ParsedAccountBase<T> | undefined> {
    let id: PublicKey;
    if (typeof pubKey === 'string') {
      id = new PublicKey(pubKey);
    } else {
      id = pubKey;
    }

    const address = id.toBase58();
    if (isStatic) {
      this.statics.add(address)
    }
    
    let account = this.genericCache.get(address) as ParsedAccountBase<T>;
    if (account) {
      return account;
    }

    const existingQuery = this.pendingCalls.get(address) as Promise<ParsedAccountBase<T>>;
    if (existingQuery) {
      return existingQuery;
    }

    const query = this.addToBatch(id).then(data => {
      this.watch(id, parser, !!data);
      if (!data) {
        this.genericCache.set(id.toBase58(), null)
        return undefined;
      }

      return this.add(id, data, parser) || {
        pubkey: id,
        account: data,
        info: undefined
      };
    });
    this.pendingCalls.set(address, query as any);

    return query;
  }

  onAccountChange<T>(key: PublicKey, parser: AccountParser<T> | undefined, account: AccountInfo<Buffer>) {
    this.add(key, account, parser)
  }

  watch<T>(id: PublicKey, parser?: AccountParser<T>, exists: Boolean = true): void {
    const address = id.toBase58()
    const isStatic = this.statics.has(address)
    if (exists && !isStatic) { // Only websocket watch accounts that exist
      this.missingAcccounts.delete(address);

      // Don't recreate listeners
      if (!this.accountChangeListeners.has(address)) {
        console.log(`Watching ${address}`);
        this.accountChangeListeners.set(
          address,
          this.connection.onAccountChange(id, this.onAccountChange.bind(this, id, parser), this.commitment)
        );
      }
    } else { // Poll accounts that don't exist
      if (!this.missingAcccounts.has(address) && !this.missingAcccounts.get(address)) { // If a parser is defined, don't set it.
        this.missingAcccounts.set(address, parser);
      }
    }
  }

  async query<T>(
    pubKey: string | PublicKey,
    parser?: AccountParser<T>
  ): Promise<ParsedAccountBase<T>> {
    const ret = await this.search(pubKey, parser);
    if (!ret) {
      throw new Error('Account not found');
    }

    return ret;
  }

  add<T>(
    id: PublicKey | string,
    obj: AccountInfo<Buffer>,
    parser?: AccountParser<T>,
    isActive?: boolean | undefined | ((parsed: any) => boolean),
  ): ParsedAccountBase<T> | undefined {
    const address = typeof id === 'string' ? id : id?.toBase58();
    const deserialize = parser ? parser : this.keyToAccountParser.get(address) as AccountParser<T> | undefined;
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

    const subId = this.accountChangeListeners.get(key);
    if (subId) {
      this.connection.removeAccountChangeListener(subId);
      this.accountChangeListeners.delete(key);
    }

    if (this.genericCache.get(key)) {
      this.genericCache.delete(key);
      this.emitter.raiseCacheDeleted(key);
      return true;
    }
    return false;
  }

  byParser<T>(parser: AccountParser<T>) {
    const result: string[] = [];
    for (const id of this.keyToAccountParser.keys()) {
      if (this.keyToAccountParser.get(id) === parser) {
        result.push(id);
      }
    }

    return result;
  }

  registerParser<T>(pubkey: PublicKey | string, parser: AccountParser<T>) {
    if (pubkey) {
      const address = typeof pubkey === 'string' ? pubkey : pubkey?.toBase58();
      this.keyToAccountParser.set(address, parser);
    }

    return pubkey;
  }
}
