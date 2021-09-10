import React, { useEffect, useMemo, useState } from 'react';
import { useConnection } from '@oyster/common';
import { Button } from '../Button';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getNftNameRecordKey } from '../utils/nftVerifier';
// @ts-ignore
import compareImages from "resemblejs/compareImages";
import axios from "axios";
import { useAsync, useAsyncCallback } from 'react-async-hook';
import { Spinner } from '../Spinner';
import { Alert } from '../Alert';
import { NFT_VERIFIER_URL } from "../constants/globals";
import { sendAndConfirmRawTransaction } from '@solana/web3.js';
import { useWallet } from '../contexts';
import { useAccountFetchCache, truthy } from '../utils';

async function getBufferFromUrl(url: string): Promise<Blob> {
  const response = await axios.get(url,  { responseType: 'blob' })
  return response.data
}

interface ITagArgs {
  imgUrls: string[];
  tokenMetadata: string;
  feePayer: string;
}
async function tag(connection: Connection, signTransaction: (transaction: Transaction) => Promise<Transaction>, args: ITagArgs): Promise<void> {
  const resp = await axios.post(NFT_VERIFIER_URL + "/verify", args, {
    responseType: "json"
  });
  const tx = Transaction.from(resp.data.data);
  const signed = await signTransaction(tx);
  await sendAndConfirmRawTransaction(connection, signed.serialize());
}

export const TaggableImage = React.memo(({ percent, selected, onSelect, src, images }: { percent: number, selected: boolean, onSelect: () => void, src: string, images: HTMLImageElement[] }) => {
  const [toRemove, setToRemove] = useState<HTMLElement[]>([]);
  const [hovering, setHovering] = useState(false);
  function removeAll() {
    toRemove.forEach(el => el.remove())
  }
  function addHovers(color: string) {
    setToRemove(images.map(img => {
      const div = window.document.createElement("div");
      const imgRect = img.getBoundingClientRect();
      div.style.zIndex = "10000"
      div.style.backgroundColor = color;
      div.style.opacity = "0.5";
      div.style.position = "fixed";
      div.style.top = imgRect.top + "px";
      div.style.left = imgRect.left + "px";
      div.style.height = img.height + "px";
      div.style.width = img.width + "px";
      document.body.append(div)
      return div;
    }))
  }
  useEffect(() => {
    removeAll()
    if (selected) {
      addHovers("#1ABC9C")
    } else if (hovering) {
      addHovers("#3498DB")
    }

    return () => {
      removeAll()
    }
  }, [selected, hovering])

  function handleSelect() {
    if (selected) { // When toggling from selected to not selected, add the hover color back

    }
    removeAll();
    onSelect();
  }

  return <label
    htmlFor={src}
    className="inline-flex items-center mt-3"
    onMouseEnter={() => {
      setHovering(true)
    }}
    onMouseLeave={() => {
      setHovering(false)
    }}
    onClick={handleSelect}
  >
    <input
      name={src}
      className="form-checkbox h-5 w-5 mr-2"
      type="checkbox"
      onChange={e => {
        // Do nothing, handled by div
      }}
      value={src}
      checked={selected}
    />
    <div title={src} className="max-w-52 truncate">
      ({(100 - percent).toFixed(2)}%) {src}
    </div>
  </label>
})

export function getUntaggedImages(): HTMLImageElement[] {
  const nonWumNodes = [...document.body.children].filter(c => c.id != "WUM" && c.id != "headlessui-portal-root");
  return nonWumNodes.flatMap(n => [...n.querySelectorAll("img:not(.nft-tagged)")]) as HTMLImageElement[];
}

type TagMatch = { percent: number, els: HTMLImageElement[] };
export const TaggableImages = React.memo(({ metadata, src }: { metadata: PublicKey, src: string }) => {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const images = useMemo(() => getUntaggedImages(), [refreshCounter]);
  const { result: img1 } = useAsync(getBufferFromUrl, [src]);
  const [matches, setMatches] = useState<Record<string, TagMatch>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  if (error) {
    console.error(error);
  }
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const connection = useConnection();
  const { awaitingApproval, publicKey, signTransaction } = useWallet();

  async function tagAll() {
    const imgUrls = Object.entries(selected).filter(([_, isSelected]) => isSelected).map(([key]) => key)
    await tag(connection, signTransaction, {
      imgUrls,
      tokenMetadata: metadata.toBase58(),
      feePayer: publicKey!.toBase58()
    })
    setSelected({});
    setMatches(matches => {
      imgUrls.forEach(url => {
        delete matches[url]
      })

      return matches
    })
  }
  const { execute, loading: executing , error: executeError } = useAsyncCallback(tagAll);
  const cache = useAccountFetchCache();
  
  useEffect(() => {
    (async () => {
      if (img1) {
        try {
          setLoading(true)
          const imagesBySrc = images.reduce((acc, img) => {
            acc[img.src] = acc[img.src] || [];
            acc[img.src].push(img);
      
            return acc;
          }, {} as Record<string, HTMLImageElement[]>)
          const newMatches = (await Promise.all(
            Object.entries(imagesBySrc).map(async ([img2Src, images]) => {
              const key = await getNftNameRecordKey(img2Src);
              const alreadyExists = await cache.search(key);

              if (!alreadyExists) {
                const img2 = await getBufferFromUrl(img2Src);
                const mismatchPercent = +(await compareImages(img1, img2, { scaleToSameSize: true, })).misMatchPercentage;
                if (mismatchPercent <= 15) {
                  return [img2Src, {
                    percent: mismatchPercent,
                    els: images
                  }] as readonly [string, TagMatch]
                }
              }

              return null;
            })
          )).filter(truthy).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as Record<string, TagMatch>);

          setMatches(() => newMatches)
        } catch (err) {
          setError(err)
        } finally {
          setLoading(false)
        }
      }
    })()
  }, [cache, img1, images]);

  return <div className="flex flex-col">
    <Button onClick={() => setRefreshCounter(c => c + 1)}>Refresh</Button>
    {(error || executeError) && <Alert type="error" message={(error || executeError)!.toString()}/> }
    { Object.entries(matches).sort(([k1, { percent: percent1 }], [k2, { percent: percent2 }]) => percent1 - percent2).map(([src, { els, percent }]) => 
      <TaggableImage
        key={src} 
        src={src}
        percent={percent}
        images={els}
        onSelect={() => setSelected(s => ({ ...s, [src]: !s[src] }))}
        selected={!!selected[src]}
      />
    ) }
    { loading && <Spinner color="primary" /> }
    <Button block disabled={executing} onClick={execute}>
      {executing && (
        <div className="mr-4">
          <Spinner size="sm" />
        </div>
      )}
      { executing && !awaitingApproval && "Tagging" }
      { awaitingApproval && "Awaiting Approval" }
      { !executing && "Tag" }
    </Button>
  </div>
})
