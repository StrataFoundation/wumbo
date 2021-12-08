import { useEffect, useState } from "react";
import { getNftMint, getUntaggedImages, truthy } from "wumbo-common";
import { useAccountFetchCache } from "@strata-foundation/react";
import { AccountFetchCache } from "@strata-foundation/spl-utils";

interface INft {
  img: HTMLImageElement;
  mintKey: string;
  observer: MutationObserver;
}

let metadataKeyCache = new Map<string, string>();
async function getNftMintCached(
  cache: AccountFetchCache,
  src: string
): Promise<string | undefined> {
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
      timeout && clearTimeout(timeout);

      try {
        const images = getUntaggedImages();

        const newNfts = (
          await Promise.all(
            images.flatMap(async (img) => {
              const mintKey = await getNftMintCached(cache, img.src);
              if (mintKey) {
                img.className = `${img.className} nft-tagged`;
                if (!img.id) {
                  incrementingId++;
                  img.id = "nft_id_" + incrementingId;
                }

                const observer = new MutationObserver(function (changes) {
                  if (
                    changes.some((change) =>
                      change.attributeName?.includes("src")
                    )
                  ) {
                    img.className = img.className.replace("nft-tagged", "");
                    setNfts((nfts) => {
                      observer.disconnect();
                      return nfts.filter((nft) => nft.img != img);
                    });
                  }
                });
                observer.observe(img, { attributeFilter: ["src"] });

                return {
                  img,
                  // Have to use a string so that isEqual doesn't fail
                  mintKey,
                  observer,
                };
              }

              return null;
            })
          )
        ).filter(truthy);

        if (newNfts.length > 0) {
          setNfts((nfts) => [...nfts, ...newNfts]);
        }
      } catch (e) {
        console.error(e);
      }

      // Ensure only one running at a time by continually clearing and setting timeout
      timeout = setTimeout(getNfts, 1000);

      return () => nfts.forEach((nft) => nft.observer.disconnect());
    };

    timeout && clearTimeout(timeout);
    getNfts();
  }, [cache]);

  return nfts;
};
