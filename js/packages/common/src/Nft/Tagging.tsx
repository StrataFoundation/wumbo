import React, { useEffect, useMemo, useState } from "react";
import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmRawTransaction,
} from "@solana/web3.js";
import { useConnection } from "@oyster/common";
import { VStack, HStack, Box, Text, Checkbox, Button } from "@chakra-ui/react";
import { Spinner } from "../";
// @ts-ignore
import compareImages from "resemblejs/compareImages";
import axios from "axios";
import { useAsync, useAsyncCallback } from "react-async-hook";
import { NFT_VERIFIER_URL } from "../constants/globals";
import { handleErrors, useWallet } from "../contexts";
import {
  useAccountFetchCache,
  truthy,
  getNftNameRecordKey,
  classNames,
} from "../utils";

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
      const addHovers = (color: string, lines?: boolean) => {
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
        addHovers("#4239B1");
      }

      return () => {
        removeAll();
      };
    }, [selected, hovering]);

    const handleSelect = () => {
      removeAll();
      onSelect();
    };

    return (
      <HStack
        spacing={4}
        padding={4}
        bgColor="gray.100"
        rounded="lg"
        _hover={{ cursor: "pointer", bgColor: "gray.200" }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSelect();
        }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <Checkbox
          name={src}
          isChecked={selected}
          borderColor="gray.700"
          size="lg"
          colorScheme="indigo"
        />
        <VStack alignItems="left" lineHeight="none" overflow="hidden">
          <Text fontWeight="medium" isTruncated>
            {src}
          </Text>
          <HStack w="full">
            <Text fontSize="sm" color="gray.700">
              Verification Match: {sanitizedPercent}%
            </Text>
            <Box
              h={2}
              w={2}
              rounded="full"
              bgColor={+sanitizedPercent >= 95 ? "green.500" : "yellow.500"}
            />
          </HStack>
        </VStack>
      </HStack>
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
  const { result: img1, error: bufferError } = useAsync(getBufferFromUrl, [
    src,
  ]);
  const [matches, setMatches] = useState<Record<string, TagMatch>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [allSelected, setAllSelected] = useState<boolean>(false);
  const { awaitingApproval, publicKey, signTransaction } = useWallet();

  handleErrors(bufferError, error);
  const cache = useAccountFetchCache();

  const handleSetSelected = (src: string) => {
    setSelected((s) => {
      const wasSelected = !!s[src];

      if (wasSelected) {
        setAllSelected(false);
      }

      if (!wasSelected) {
        // check if all other matches are selected
        // if so mark all selected
        const refObj = Object.entries(matches).reduce(
          (acc, [src]) => ({ ...acc, [src]: true }),
          {}
        );
        if (
          JSON.stringify(refObj) ===
          JSON.stringify({ ...selected, [src]: !wasSelected })
        ) {
          setAllSelected(true);
        }
      }

      return { ...s, [src]: !wasSelected };
    });
  };

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

  const {
    execute,
    loading: executing,
    error: executeError,
  } = useAsyncCallback(tagAll);
  handleErrors(executeError);

  useEffect(() => {
    if (allSelected) {
      setSelected(
        Object.entries(matches).reduce(
          (acc, [src]) => ({
            ...acc,
            [src]: true,
          }),
          {}
        )
      );
    }

    if (!allSelected) {
      setSelected({});
    }
  }, [allSelected, matches, setSelected]);

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
                const alreadyExists = await cache.search(key, undefined, true);

                if (!alreadyExists) {
                  const img2 = await getBufferFromUrl(img2Src);
                  const mismatchPercent = +(
                    await compareImages(img1, img2, { scaleToSameSize: true })
                  ).misMatchPercentage;
                  if (mismatchPercent <= 25) {
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
    <VStack width="full" spacing={4} padding={4} alignItems="center">
      {loading && <Spinner size="lg" />}
      {!loading && Object.entries(matches).length > 0 && (
        <VStack w="full" spacing={4} alignItems="left">
          <HStack
            spacing={4}
            padding={4}
            bgColor="gray.100"
            rounded="lg"
            _hover={{ cursor: "pointer", bgColor: "gray.200" }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAllSelected(!allSelected);
            }}
          >
            <Checkbox
              name="selectAll"
              isChecked={allSelected}
              borderColor="gray.700"
              size="lg"
              colorScheme="indigo"
            />
            <VStack alignItems="left" lineHeight="none" overflow="hidden">
              <Text fontWeight="medium">
                {`${allSelected ? "De" : ""}Select All`}
              </Text>
            </VStack>
          </HStack>
          {Object.entries(matches)
            .sort(
              ([k1, { percent: percent1 }], [k2, { percent: percent2 }]) =>
                percent1 - percent2
            )
            .map(([src, { els, percent }]) => (
              <TaggableImage
                key={src}
                src={src}
                percent={percent}
                images={els}
                onSelect={() => handleSetSelected(src)}
                selected={!!selected[src]}
              />
            ))}
        </VStack>
      )}
      {!loading && Object.entries(matches).length === 0 && (
        <div>No Matches found to tag</div>
      )}
      <Button
        width="full"
        colorScheme="indigo"
        onClick={execute}
        disabled={executing || Object.entries(matches).length === 0}
        isLoading={executing}
        loadingText={awaitingApproval ? "Awaiting Approval" : "Tagging"}
      >
        Tag
      </Button>
    </VStack>
  );
};
