import { getNftMint, ITokenWithMeta, useAccountFetchCache, getUntaggedImages, truthy } from "wumbo-common";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { getElementsBySelector } from "./elements";
import isEqual from "lodash/isEqual";
import { useConnection } from "@oyster/common";
import { AccountFetchCache } from "@/../../common/dist/lib/utils/accountFetchCache/accountFetchCache";

interface INft {
  img: HTMLImageElement;
  mintKey: string;
}


let metadataKeyCache = new Map<string, string>()
async function getNftMintCached(cache: AccountFetchCache, src: string): Promise<string | undefined> {
  if (metadataKeyCache.has(src)) {
    return metadataKeyCache.get(src);
  }

  return (await getNftMint(cache, src))?.toBase58();
}

let incrementingId = 0;
export const useNfts = (): INft[] | null => {
  const [nfts, setNfts] = useState<INft[]>([]);
  const cache = useAccountFetchCache();

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    const getNfts = async () => {
      timeout && clearTimeout(timeout)

      try {
        const images = getUntaggedImages();
        
        const newNfts = (await Promise.all(
          images.flatMap(async (img) => {
            const mintKey = await getNftMintCached(cache, img.src);
            if (mintKey) {
              img.className = `${img.className} nft-tagged`
              if (!img.id) {
                incrementingId++;
                img.id = "nft_id_" + incrementingId;
              }

              return {
                img,
                // Have to use a string so that isEqual doesn't fail
                mintKey
              }
            }

            return null
          })
        )).filter(truthy)

        if (newNfts.length > 0) {
          setNfts(nfts => [...nfts, ...newNfts]);
        }
      } catch (e) {
        console.error(e);
      }

      // Ensure only one running at a time by continually clearing and setting timeout
      timeout = setTimeout(getNfts, 1000)
    }

    timeout && clearTimeout(timeout)
    getNfts();
  }, [cache])

  return nfts;
};
