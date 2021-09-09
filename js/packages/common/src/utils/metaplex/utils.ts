import {
  Creator,
  findProgramAddress,
  METADATA_PREFIX,
  programIds,
} from "@oyster/common";
import { PublicKey } from "@solana/web3.js";

const USE_CDN = false; // copied from metaplex. Guess support isn't there yet?
const routeCDN = (uri: string) => {
  let result = uri;
  if (USE_CDN) {
    result = uri.replace(
      "https://arweave.net/",
      "https://coldcdn.com/api/cdn/bronil/"
    );
  }

  return result;
};

const imageFromJson = (newUri: string, extended: any) => {
  if (!extended || extended?.properties?.files?.length === 0) {
    return;
  }

  if (extended?.image) {
    const file = extended.image.startsWith("http")
      ? extended.image
      : `${newUri}/${extended.image}`;
    return routeCDN(file);
  }
};

export async function getArweaveMetadata(uri: string | undefined) {
  if (uri) {
    const newUri = routeCDN(uri);

    const cached = localStorage.getItem(newUri);
    if (cached) {
      return JSON.parse(cached);
    } else {
      try {
        // TODO: BL handle concurrent calls to avoid double query
        const result = await fetch(newUri);
        const data = await result.json();
        localStorage.setItem(newUri, JSON.stringify(data));
        return data
      } catch(e) {
        console.log(`Could not fetch from ${uri}`, e)
        return undefined;
      }
    }
  }
}

export async function getImage(
  uri: string | undefined
): Promise<string | undefined> {
  if (uri) {
    const newUri = routeCDN(uri);
    return imageFromJson(newUri, await getArweaveMetadata(uri))
  }
}

export async function getDescription(
  uri: string | undefined
): Promise<string | undefined> {
  if (uri) {
    return (await getArweaveMetadata(uri))?.description
  }
}

export async function getMetadataKey(
  token: PublicKey | undefined
): Promise<PublicKey | undefined> {
  if (token) {
    return (
      await findProgramAddress(
        [
          Buffer.from(METADATA_PREFIX),
          programIds().metadata.toBuffer(),
          token.toBuffer(),
        ],
        programIds().metadata
      )
    )[0];
  }
}

export function getFilesWithMetadata(
  files: File[],
  metadata: {
    name: string;
    symbol: string;
    description: string;
    image: string | undefined;
    animation_url: string | undefined;
    external_url: string;
    properties: any;
    creators: Creator[] | null;
    sellerFeeBasisPoints: number;
  }
): File[] {
  const metadataContent = {
    name: metadata.name,
    symbol: metadata.symbol,
    description: metadata.description,
    seller_fee_basis_points: metadata.sellerFeeBasisPoints,
    image: metadata.image,
    animation_url: metadata.animation_url,
    external_url: metadata.external_url,
    properties: {
      ...metadata.properties,
      creators: metadata.creators?.map((creator) => {
        return {
          address: creator.address.toBase58(),
          share: creator.share,
        };
      }),
    },
  };

  return [
    ...files,
    new File([JSON.stringify(metadataContent)], "metadata.json"),
  ];
}
