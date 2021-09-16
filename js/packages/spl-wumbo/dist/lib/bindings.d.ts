import { Connection, PublicKey } from "@solana/web3.js";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { NameRegistryState } from "@bonfida/spl-name-service";
export declare const SOL_TOKEN: PublicKey;
interface IWumboConfig {
    splWumboProgramId: PublicKey;
    twitterTld: PublicKey;
    wumboInstanceId: PublicKey;
}
export interface CreateSocialTokenResult {
    tokenRefKey: PublicKey;
    tokenBondingKey: PublicKey;
    ownerKey: PublicKey;
}
export declare type CreateWumboCreatorParams = {
    splWumboProgramId: PublicKey;
    splNameServicePogramId: PublicKey;
    splTokenProgramId: PublicKey;
    splTokenBondingProgramId: PublicKey;
    splAssociatedTokenAccountProgramId: PublicKey;
    wumboInstance: PublicKey;
    payer: WalletAdapter;
    baseMint: PublicKey;
    founderRewardsPercentage: number;
    name: string;
    nameClass?: PublicKey;
    nameParent?: PublicKey;
};
export declare class Wumbo {
    config: IWumboConfig;
    constructor(config: IWumboConfig);
    getTwitterRegistry(connection: Connection, handle: string): Promise<NameRegistryState>;
    getTwitterHandle: (connection: Connection, twitterHandle: string) => Promise<NameRegistryState | null>;
    getTwitterUnclaimedTokenRefKey(name: string): Promise<PublicKey>;
    getTokenRefKeyFromOwner(owner: PublicKey | undefined): Promise<PublicKey | undefined>;
    getTokenRefKeyFromBonding(tokenBonding: PublicKey | undefined): Promise<PublicKey | undefined>;
    getTwitterClaimedTokenRefKey(connection: Connection, name: string): Promise<PublicKey | undefined>;
    static createWumboSocialToken(connection: Connection, params: CreateWumboCreatorParams): Promise<CreateSocialTokenResult>;
}
export {};
//# sourceMappingURL=bindings.d.ts.map