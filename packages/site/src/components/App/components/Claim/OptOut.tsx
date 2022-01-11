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
            Although we would love for you to stay and grow the{" "}
            <Link
              href="https://www.strataprotocol.com/blog/open-collective"
              isExternal
              color="indigo.500"
            >
              OPEN collective
            </Link>{" "}
            alongside your social token, we understand if you want to opt out of
            the experience. You'll be leaving behind your fans who have already
            allocated{" "}
            <Text as="span" color="green.600" fontWeight={900}>
              ${fiatLocked}
            </Text>{" "}
            to you and a claimable amount of{" "}
            <Text as="span" color="green.600" fontWeight={900}>
              ${claimableAmount}
            </Text>{" "}
            in your own social token.
          </Text>
        </VStack>
        <VStack align="left">
          <Text fontSize="lg" fontWeight="500">
            Had a change of heart?
          </Text>
          <Text fontSize="md">
            Listen we wont fault you if you came here wanting to opt out. But if
            you want to grow the{" "}
            <Link
              href="https://www.strataprotocol.com/blog/open-collective"
              isExternal
              color="indigo.500"
            >
              OPEN collective
            </Link>{" "}
            alongside your peers. Then please claim your profile and participate
            in the community either on{" "}
            <Link href="discord.gg/S8wJBR2BQV" color="indigo.500">
              discord
            </Link>{" "}
            or{" "}
            <Link href="https://twitter.com/TeamWumbo" color="indigo.500">
              twitter
            </Link>
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
              Claim Profile
            </Button>
          </VStack>
        </Flex>
        <VStack align="left" spacing={4}>
          <Text fontSize="lg" fontWeight="500">
            If you still wish to go through with opting out please follow the
            directions below.
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
