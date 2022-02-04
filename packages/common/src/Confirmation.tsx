import {
  Link,
  HStack,
  Avatar,
  Button,
  StackDivider,
  Text,
  VStack,
  Heading,
  Icon,
} from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import { Spinner, useMint, useTokenMetadata } from "@strata-foundation/react";
import { RiCheckboxCircleFill } from "react-icons/ri";
import { RiTwitterFill } from "react-icons/ri";
import React, { ReactNode } from "react";

export const Confirmation = ({
  tweet,
  image,
  bottomText,
  children,
}: {
  image?: string;
  tweet?: string;
  bottomText?: string;
  children: ReactNode;
}) => {
  return (
    <VStack
      padding={4}
      spacing={4}
      w="full"
      divider={<StackDivider borderColor="gray.200" />}
    >
      <VStack spacing={4} align="left" w="full">
        {image && <Avatar src={image} />}
        <HStack spacing={2}>
          <Text fontWeight={800} fontSize="24px">
            Transaction Complete
          </Text>
          <Icon as={RiCheckboxCircleFill} color="green.400" w="24px" h="24px" />
        </HStack>

        {children}
      </VStack>
      {tweet && (
        <VStack spacing={4} align="left" w="full">
          <Text fontWeight={800}>{bottomText}</Text>
          <Button
            as={Link}
            isExternal
            leftIcon={<Icon as={RiTwitterFill} />}
            colorScheme="twitter"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              tweet
            )}`}
          >
            Tweet
          </Button>
        </VStack>
      )}
    </VStack>
  );
};
