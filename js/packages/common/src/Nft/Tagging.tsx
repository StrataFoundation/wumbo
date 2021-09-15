import React, { useEffect, useMemo, useState } from "react";
import { Connection, PublicKey, Transaction, sendAndConfirmRawTransaction } from "@solana/web3.js";
import { useConnection } from "@oyster/common";
// @ts-ignore
import compareImages from "resemblejs/compareImages";
import axios from "axios";
import { useAsync, useAsyncCallback } from "react-async-hook";
import { NFT_VERIFIER_URL } from "../constants/globals";
import { useWallet } from "../contexts";
import { useAccountFetchCache, truthy, getNftNameRecordKey, classNames } from "../utils";
import { Button, Spinner, Alert } from "../";

interface ITagArgs {
  imgUrls: string[];
  tokenMetadata: string;
  feePayer: string;
}

const getBufferFromUrl = async (url: string): Promise<Blob> => {
  const response = await axios.get(url, { responseType: "blob" });
  return response.data;
};

const tag = async (
  connection: Connection,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  args: ITagArgs
): Promise<void> => {
  const resp = await axios.post(NFT_VERIFIER_URL + "/verify", args, {
    responseType: "json",
  });
  const tx = Transaction.from(resp.data.data);
  const signed = await signTransaction(tx);
  await sendAndConfirmRawTransaction(connection, signed.serialize());
};

export const TaggableImage = React.memo(
  ({
    percent,
    selected,
    onSelect,
    src,
    images,
  }: {
    percent: number;
    selected: boolean;
    onSelect: () => void;
    src: string;
    images: HTMLImageElement[];
  }) => {
    const [toRemove, setToRemove] = useState<HTMLElement[]>([]);
    const [hovering, setHovering] = useState(false);
    const removeAll = () => toRemove.forEach((el) => el.remove());
    let sanitizedPercent = (100 - percent).toFixed();

    useEffect(() => {
      removeAll();
      const addHovers = (color: string, lines: boolean) => {
        setToRemove(
          images.map((img) => {
            const div = window.document.createElement("div");
            const imgRect = img.getBoundingClientRect();
            div.style.zIndex = "10000";
            div.style.backgroundColor = color;
            div.style.opacity = "0.5";
            div.style.position = "fixed";
            div.style.top = imgRect.top + "px";
            div.style.left = imgRect.left + "px";
            div.style.height = img.height + "px";
            div.style.width = img.width + "px";
            lines &&
              (div.style.background =
                "repeating-linear-gradient(45deg, #4239B1, #4239B1 2px, #00CE90 2px, #00CE90 20px )");
            document.body.append(div);
            return div;
          })
        );
      };

      if (selected) {
        addHovers("#00CE90", true);
      } else if (hovering) {
        addHovers("#4239B1", false);
      }

      return () => {
        removeAll();
      };
    }, [selected, hovering]);

    const handleSelect = () => {
      if (selected) {
        // When toggling from selected to not selected, add the hover color back
      }
      removeAll();
      onSelect();
    };

    return (
      <label
        htmlFor={src}
        className="flex gap-2 items-center mt-3 bg-gray-100 px-2 py-4 rounded-md w-full"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={handleSelect}
      >
        <input
          name={src}
          type="checkbox"
          className="appearance-none checked:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
          onChange={(e) => {
            // Do nothing, handled by div
          }}
          value={src}
          checked={selected}
        />
        <div className="flex flex-col w-full overflow-hidden hover:cursor-pointer">
          <div title={src} className="truncate">
            {src}
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">Verification Match: {sanitizedPercent}%</span>
            <div
              className={classNames(
                "rounded-full h-2.5 w-2.5",
                +sanitizedPercent >= 95 && "bg-green-500",
                +sanitizedPercent < 95 && +sanitizedPercent >= 85 && "bg-yellow-500"
              )}
            />
          </div>
        </div>
      </label>
    );
  }
);

export function getUntaggedImages(): HTMLImageElement[] {
  const nonWumNodes = [...document.body.children].filter(
    (c) => c.id != "WUM" && c.id != "headlessui-portal-root"
  );
  return nonWumNodes.flatMap((n) => [
    ...n.querySelectorAll("img:not(.nft-tagged)"),
  ]) as HTMLImageElement[];
}

type TagMatch = { percent: number; els: HTMLImageElement[] };
export const TaggableImages = ({
  metadata,
  src,
  refreshCounter,
}: {
  metadata: PublicKey;
  src: string;
  refreshCounter: number;
}) => {
  const connection = useConnection();
  const images = useMemo(() => getUntaggedImages(), [refreshCounter]);
  const { result: img1 } = useAsync(getBufferFromUrl, [src]);
  const [matches, setMatches] = useState<Record<string, TagMatch>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const { awaitingApproval, publicKey, signTransaction } = useWallet();
  const cache = useAccountFetchCache();

  const tagAll = async () => {
    const imgUrls = Object.entries(selected)
      .filter(([_, isSelected]) => isSelected)
      .map(([key]) => key);
    await tag(connection, signTransaction, {
      imgUrls,
      tokenMetadata: metadata.toBase58(),
      feePayer: publicKey!.toBase58(),
    });
    setSelected({});
    setMatches((matches) => {
      imgUrls.forEach((url) => {
        delete matches[url];
      });

      return matches;
    });
  };

  const { execute, loading: executing, error: executeError } = useAsyncCallback(tagAll);

  if (error) {
    // TODO add to global error
    console.error(error);
  }

  useEffect(() => {
    (async () => {
      if (img1) {
        try {
          setLoading(true);
          const imagesBySrc = images.reduce((acc, img) => {
            acc[img.src] = acc[img.src] || [];
            acc[img.src].push(img);

            return acc;
          }, {} as Record<string, HTMLImageElement[]>);
          const newMatches = (
            await Promise.all(
              Object.entries(imagesBySrc).map(async ([img2Src, images]) => {
                const key = await getNftNameRecordKey(img2Src);
                const alreadyExists = await cache.search(key);

                if (!alreadyExists) {
                  const img2 = await getBufferFromUrl(img2Src);
                  const mismatchPercent = +(
                    await compareImages(img1, img2, { scaleToSameSize: true })
                  ).misMatchPercentage;
                  if (mismatchPercent <= 15) {
                    return [
                      img2Src,
                      {
                        percent: mismatchPercent,
                        els: images,
                      },
                    ] as readonly [string, TagMatch];
                  }
                }

                return null;
              })
            )
          )
            .filter(truthy)
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {} as Record<string, TagMatch>);

          setMatches(() => newMatches);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [cache, img1, images]);

  return (
    <div className="flex flex-col items-center">
      {(error || executeError) && (
        <Alert type="error" message={(error || executeError)!.toString()} />
      )}
      {loading && <Spinner color="primary" />}
      {!loading && (
        <label
          htmlFor="selectAll"
          className="flex gap-2 items-center bg-gray-100 px-2 py-4 rounded-md w-full"
          onClick={() => console.log("implSelectAll")}
        >
          <input
            name="selectAll"
            type="checkbox"
            className="appearance-none checked:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
            onChange={(e) => {
              // Do nothing, handled by div
            }}
            value="selectAll"
            checked={false}
          />
          <div className="flex flex-col w-full overflow-hidden hover:cursor-pointer">
            <div className="truncate">Select All</div>
          </div>
        </label>
      )}
      {!loading &&
        Object.entries(matches)
          .sort(([k1, { percent: percent1 }], [k2, { percent: percent2 }]) => percent1 - percent2)
          .map(([src, { els, percent }]) => (
            <TaggableImage
              key={src}
              src={src}
              percent={percent}
              images={els}
              onSelect={() => setSelected((s) => ({ ...s, [src]: !s[src] }))}
              selected={!!selected[src]}
            />
          ))}
      <Button block disabled={executing} onClick={execute} className="mt-4">
        {executing && (
          <div className="mr-4">
            <Spinner size="sm" />
          </div>
        )}
        {executing && !awaitingApproval && "Tagging"}
        {awaitingApproval && "Awaiting Approval"}
        {!executing && "Tag"}
      </Button>
    </div>
  );
};
