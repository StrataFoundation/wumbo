import React, { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  StackDivider,
  Icon,
  VStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Center,
} from "@chakra-ui/react";
import { RiCoinLine } from "react-icons/ri";
import Fuse from "fuse.js";
import {
  ITokenWithMetaAndAccount,
  SplTokenCollective,
} from "@strata-foundation/spl-token-collective";
import { useUserTokensWithMeta } from "../hooks";
import { TokenInfo } from "./Wallet";
import { BiSearch } from "react-icons/bi";
import { Spinner } from "../Spinner";
import { useWallet } from "@solana/wallet-adapter-react";

const SearchError = ({
  title = "",
  subTitle = "",
  description = "",
}: {
  title: string;
  subTitle: string;
  description: string;
}) => {
  return (
    <VStack px={8} py={4} rounded={4} spacing={0} border="1px solid #E1E3E8">
      <Icon h="44px" w="44px" as={RiCoinLine} color="gray.300" />
      <Text fontWeight={800} fontSize="14px">
        {title}
      </Text>
      <Text fontSize="14px">{subTitle}</Text>
      <Text mt={4} fontSize="14px" color="gray.500">
        {description}
      </Text>
    </VStack>
  );
};

export const SendSearch = React.memo(
  ({
    getSendLink,
  }: {
    getSendLink: (tokenWithMeta: ITokenWithMetaAndAccount) => string;
  }) => {
    const { wallet } = useWallet();
    const publicKey = wallet?.adapter?.publicKey;
    const { data: tokens, loading } = useUserTokensWithMeta(
      publicKey || undefined
    );
    const [search, setSearch] = useState("");
    const history = useHistory();
    const [focusIndex, setFocusIndex] = useState(0);

    const searched = useMemo(() => {
      if (tokens) {
        const sorted = tokens
          ?.filter((t) => !!t.metadata)
          .sort((a, b) =>
            a.metadata!.data.name.localeCompare(b.metadata!.data.name)
          );
        if (search) {
          return new Fuse(sorted, {
            keys: ["metadata.data.name", "metadata.data.symbol"],
            threshold: 0.2,
          })
            .search(search)
            .map((result) => result.item);
        } else {
          return sorted;
        }
      }
      return [];
    }, [tokens, search]);

    useEffect(() => {
      if (searched.length - 1 < focusIndex && searched.length != 0) {
        setFocusIndex(searched.length - 1);
      }
    }, [searched]);

    const tokenInfos = searched.map((tokenWithMeta, index) => (
      <TokenInfo
        highlighted={index == focusIndex}
        key={tokenWithMeta.publicKey?.toBase58()}
        tokenWithMeta={tokenWithMeta}
        getTokenLink={getSendLink}
      />
    ));

    return (
      <VStack w="full">
        <InputGroup>
          <InputLeftElement h="full" pointerEvents="none">
            <Center>
              <Icon w="20px" h="20px" color="gray.500" as={BiSearch} />
            </Center>
          </InputLeftElement>
          <Input
            autoFocus
            display="auto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="lg"
            placeholder="Search Tokens"
            onKeyDown={(e) => {
              if (e.key == "Enter" && searched[focusIndex]) {
                history.push(getSendLink(searched[focusIndex]));
              } else if (e.key == "ArrowDown") {
                setFocusIndex((i) =>
                  i == searched.length - 1 ? searched.length - 1 : i + 1
                );
              } else if (e.key == "ArrowUp") {
                setFocusIndex((i) => (i == 0 ? 0 : i - 1));
              }
            }}
          />
        </InputGroup>
        <VStack
          pt={2}
          align="stretch"
          divider={<StackDivider borderColor="gray.200" />}
          w="full"
        >
          {tokenInfos}
        </VStack>
        {loading && <Spinner />}
        {!loading &&
          tokenInfos?.length == 0 &&
          (search && search.length > 0 ? (
            <SearchError
              title="Could Not Find Token"
              subTitle="We couldn't find this token in your wallet."
              description="If you have this token in another wallet, please fund this wallet first. This wallet doesn't support custom tokens right now."
            />
          ) : (
            <SearchError
              title="No Tokens"
              subTitle="It looks like your wallet is empty."
              description="Send tokens or by tokens from this wallet first, then you'll be able to send them to other wallets."
            />
          ))}
      </VStack>
    );
  }
);
