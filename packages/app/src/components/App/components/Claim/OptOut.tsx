import React from "react";
import { useHistory } from "react-router-dom";
import { useQuery } from "wumbo-common";
import {
  Flex,
  VStack,
  Heading,
  Text,
  Button,
  Link,
  List,
  ListItem,
  ListIcon,
  Code,
} from "@chakra-ui/react";
import { RiFocusFill } from "react-icons/ri";
import { claimPath } from "../../../../constants/routes";

export const OptOutRoute: React.FC = () => {
  const history = useHistory();
  const query = useQuery();
  const handle = query.get("handle") || undefined;
  const fiatLocked = query.get("fiatLocked") || 0;
  const claimableAmount = query.get("claimableAmount") || 0;

  return (
    <Flex
      direction="column"
      align="center"
      w="full"
      maxW={{ md: "760px" }}
      m="0 auto"
      p={10}
    >
      <VStack w="full" spacing={12} align="left">
        <VStack w="full" spacing={8} align="left">
          <div>
            <Text fontSize="sm" fontWeight="bold" color="indigo.600">
              Wum.bo
            </Text>
            <Heading as="h1" size="xl">
              Opt Out Of Wumbo
            </Heading>
          </div>
          <Text fontSize="md">
            We would love for you to stay and grow together with the other
            creators who have joined the{" "}
            <Link
              href="https://www.strataprotocol.com/blog/open-collective"
              isExternal
              color="indigo.500"
            >
              OPEN collective
            </Link>{" "}
            by claiming their social tokens. You’ll be leaving behind your fans
            who have already allocated{" "}
            <Text as="span" color="green.600" fontWeight={900}>
              ${fiatLocked}
            </Text>{" "}
            to you with{" "}
            <Text as="span" color="green.600" fontWeight={900}>
              ${claimableAmount}
            </Text>{" "}
            claimable in your own social token.
          </Text>
        </VStack>
        <VStack align="left">
          <Text fontSize="lg" fontWeight="500">
            Consider Staying With Us
          </Text>
          <Text fontSize="md">
            We understand if you came here to opt out, but consider growing the{" "}
            <Link
              href="https://www.strataprotocol.com/blog/open-collective"
              isExternal
              color="indigo.500"
            >
              OPEN collective
            </Link>{" "}
            with your peers. You can even leave your social token unclaimed for
            your fans to build their own community around the token. Click the
            button below if you had a change of heart and want to claim your
            token, and please take a look at the community on{" "}
            <Link href="discord.gg/S8wJBR2BQV" color="indigo.500">
              discord
            </Link>{" "}
            or{" "}
            <Link href="https://twitter.com/TeamWumbo" color="indigo.500">
              twitter
            </Link>
            .
          </Text>
        </VStack>
        <Flex w="full" justifyContent="center">
          <VStack spacing={6} py={4} maxW="412px" w="full">
            <Button
              isFullWidth
              colorScheme="indigo"
              variant="outline"
              onClick={() =>
                history.push(claimPath({ step: "1", handle: handle! }))
              }
            >
              Claim Token
            </Button>
          </VStack>
        </Flex>
        <VStack align="left" spacing={4}>
          <Text fontSize="lg" fontWeight="500">
            If you still wish to opt out then please follow the directions
            below.
          </Text>
          <List spacing={4}>
            <ListItem display="flex" alignItems="center">
              <ListIcon as={RiFocusFill} color="indigo.500" />
              Open a direct message with the&nbsp;
              <Link
                href="https://twitter.com/WumboTokenBot?s=20"
                isExternal
                color="indigo.500"
              >
                WumboTokenBot.
              </Link>
            </ListItem>
            <ListItem display="flex" alignItems="center">
              <ListIcon as={RiFocusFill} color="indigo.500" />
              Message
              <Code mx={2} px={2} colorScheme="indigo">
                OPT OUT
              </Code>
              to it.
            </ListItem>
          </List>
        </VStack>
      </VStack>
    </Flex>
  );
};
