import {
  Button,
  Center,
  Flex,
  Icon,
  Select,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import { useBounties } from "@strata-foundation/marketplace-ui";
import { useErrorHandler, useQueryString } from "@strata-foundation/react";
import React, { useState } from "react";
import { BsChevronDown } from "react-icons/bs";
import { RiSortAsc, RiSortDesc } from "react-icons/ri";
import { BountyCard } from "./BountyCard";

const PAGE_SIZE = 20;

export const Bounties = ({
  mintKey,
  onBountyClick,
  onCreateClick,
}: {
  mintKey?: PublicKey;
  onBountyClick: (mint: PublicKey) => void;
  onCreateClick: () => void;
}) => {
  const [search, setSearch] = useQueryString("search", "");
  const [sort, setSort] = useQueryString("sort", "newest");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const fetchMore = () => setLimit((limit) => limit + PAGE_SIZE);
  const {
    result: bounties,
    error,
    loading,
  } = useBounties({
    baseMint: mintKey,
    search,
    sortType: sort.includes("contribution") ? "CONTRIBUTION" : "GO_LIVE",
    sortDirection: sort.includes("asc") ? "ASC" : "DESC",
    limit,
  });
  const { handleErrors } = useErrorHandler();
  handleErrors(error);
  return (
    <VStack spacing={4} align="stretch">
      <Flex direction="row">
        <Button
          onClick={onCreateClick}
          shadow="lg"
          size="xs"
          variant="outline"
          colorScheme="primary"
        >
          Create
        </Button>

        <Select
          textAlign="right"
          size="xs"
          variant="unstyled"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          borderColor="gray.200"
          backgroundColor="white"
          isFullWidth={false}
          icon={<Icon as={sort.includes("asc") ? RiSortAsc : RiSortDesc} />}
        >
          <option value="go_live_desc">Most Recent</option>
          <option value="go_live_asc">Oldest</option>
          <option value="contribution_asc">Contribution: Low to high</option>
          <option value="contribution_desc">Contribution: High to low</option>
        </Select>
      </Flex>
      <VStack spacing={4}>
        {bounties?.map((bounty) => (
          <BountyCard
            onClick={() => onBountyClick(bounty.targetMint)}
            key={bounty.tokenBondingKey.toBase58()}
            mintKey={bounty.targetMint}
          />
        ))}
        {!loading && bounties?.length === 0 && (
          <Center w="full" h="350px" p="32px">
            <VStack spacing={4}>
              <Text color="gray.500" fontWeight={600} fontSize="18px">
                Nothing to show...
              </Text>
              <Text color="gray.400" fontWeight={400} fontSize="16px">
                There were no bounties found
              </Text>
            </VStack>
          </Center>
        )}
        {loading && (
          <Center w="full" h="350px">
            <Spinner />
          </Center>
        )}
      </VStack>
      {bounties?.length == PAGE_SIZE && (
        <Button onClick={fetchMore} variant="link" colorScheme="orange">
          See More <Icon ml="6px" w="14px" h="14px" as={BsChevronDown} />
        </Button>
      )}
    </VStack>
  );
};
