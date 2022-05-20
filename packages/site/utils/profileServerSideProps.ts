import { GetServerSideProps } from "next";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Provider } from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import {
  ITokenRef,
  SplTokenCollective,
} from "@strata-foundation/spl-token-collective";
import { SplTokenMetadata } from "@strata-foundation/spl-utils";
import { DEFAULT_ENDPOINT } from "@/constants";
import { getTwitterTld, getTwitterReverse } from "@/utils";
import {
  getHashedName,
  getNameAccountKey,
  NameRegistryState,
} from "@solana/spl-name-service";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { SplTokenBonding } from "@strata-foundation/spl-token-bonding";

export const profileServerSideProps: GetServerSideProps = async (context) => {
  const connection = new Connection(DEFAULT_ENDPOINT, {
    commitment: "confirmed",
  });

  const provider = new Provider(
    connection,
    new NodeWallet(Keypair.generate()),
    {}
  );

  const entity = context.params?.entity as string;
  const tld = await getTwitterTld();
  const pK: PublicKey | undefined = (() => {
    try {
      return new PublicKey(entity);
    } catch {
      // ignore
    }
  })();

  const tokenCollectiveSdk = await SplTokenCollective.init(provider);
  const tokenMetadataSdk = await SplTokenMetadata.init(provider);
  const tokenBondingSdk = await SplTokenBonding.init(provider);

  let tokenRef: ITokenRef | null | undefined;

  if (!tokenRef && pK) {
    try {
      tokenRef = await tokenCollectiveSdk?.getTokenRef(pK);
    } catch {}
  }

  if (!tokenRef && pK) {
    try {
      const [mTRK] = await SplTokenCollective.mintTokenRefKey(pK);
      tokenRef = await tokenCollectiveSdk?.getTokenRef(mTRK);
    } catch {}
  }

  if (!tokenRef && pK) {
    try {
      const [wTRK] = await SplTokenCollective.ownerTokenRefKey({
        owner: pK,
        isPrimary: true,
      });
      tokenRef = await tokenCollectiveSdk?.getTokenRef(wTRK);
    } catch {}
  }

  if (!tokenRef && !pK) {
    const twitterRegistryKey = await getNameAccountKey(
      await getHashedName(entity),
      undefined,
      tld
    );

    try {
      const { owner } = await NameRegistryState.retrieve(
        connection,
        twitterRegistryKey
      );

      const [cTRK] = await SplTokenCollective.ownerTokenRefKey({
        owner: owner,
      });
      tokenRef = await tokenCollectiveSdk?.getTokenRef(cTRK);
    } catch {}
  }

  if (!tokenRef && !pK) {
    const twitterRegistryKey = await getNameAccountKey(
      await getHashedName(entity),
      undefined,
      tld
    );

    try {
      const [ucTRK] = await SplTokenCollective.ownerTokenRefKey({
        owner: twitterRegistryKey,
        mint: SplTokenCollective.OPEN_COLLECTIVE_MINT_ID,
      });
      tokenRef = await tokenCollectiveSdk?.getTokenRef(ucTRK);
    } catch {}
  }

  // we're making an assumption that by this point
  // one of the logic branches was successful and found a tokenRef
  // via the passed in entity
  const metadataAcc = await tokenMetadataSdk.getMetadata(
    await Metadata.getPDA(tokenRef!.mint.toBase58())
  );

  let metadata, reverseTwitter, tokenBonding;

  try {
    metadata = await SplTokenMetadata.getArweaveMetadata(metadataAcc?.data.uri);
  } catch (e: any) {
    console.error(e);
  }

  try {
    tokenBonding = await tokenBondingSdk.getTokenBonding(
      tokenRef!.tokenBonding!
    );
  } catch (e: any) {
    console.error(e);
  }

  try {
    reverseTwitter = await getTwitterReverse(connection, tokenRef!.owner!);
  } catch (e: any) {
    console.error(e);
  }

  const name =
    metadataAcc?.data?.name.length == 32
      ? metadata?.name
      : metadataAcc?.data?.name;

  return {
    props: {
      tokenBondingKeyRaw: tokenBonding?.publicKey.toBase58(),
      baseMintKeyRaw: tokenBonding?.baseMint.toBase58(),
      targetMintKeyRaw: tokenBonding?.targetMint.toBase58(),
      handle: reverseTwitter?.twitterHandle || null,
      name: name || null,
      symbol: metadataAcc?.data?.symbol || null,
      description: metadata?.description || null,
      image: (await SplTokenMetadata.getImage(metadataAcc?.data.uri)) || null,
    },
  };
};
