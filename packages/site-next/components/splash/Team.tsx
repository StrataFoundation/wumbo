import React from "react";
import {
  Box,
  Flex,
  Image,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Link,
} from "@chakra-ui/react";
import {
  RiTwitterFill,
  RiDiscordFill,
  RiExternalLinkLine,
} from "react-icons/ri";
import { LandingLayout, MatchaLogo } from "@/components";

interface ITeamMemberProps {
  image: string;
  name: string;
  title: string;
  twitter?: string;
  discord?: string;
}

const TeamMember: React.FC<ITeamMemberProps> = ({
  image,
  name,
  title,
  twitter,
  discord,
}) => (
  <VStack spacing={2}>
    <Box w={{ base: "140px", md: "180px" }} h={{ base: "140px", md: "180px" }}>
      <Image
        w="100%"
        h="100%"
        objectFit="cover"
        rounded="lg"
        src={image}
        alt={image}
      />
    </Box>
    <VStack spacing={0}>
      <Text fontSize="lg" fontWeight="bold">
        {name}
      </Text>
      <Text fontSize="md">{title}</Text>
    </VStack>
    <HStack>
      {twitter && (
        <Link href={twitter} isExternal>
          <Icon
            color="gray.400"
            _hover={{ color: "gray.500" }}
            as={RiTwitterFill}
            w={{ base: "30px", md: "40px" }}
            h={{ base: "30px", md: "40px" }}
          />
        </Link>
      )}
      {discord && (
        <Link href={discord} isExternal>
          <Icon
            color="gray.400"
            _hover={{ color: "gray.500" }}
            as={RiDiscordFill}
            w={{ base: "30px", md: "40px" }}
            h={{ base: "30px", md: "40px" }}
          />
        </Link>
      )}
    </HStack>
  </VStack>
);

export const Team: React.FC = () => (
  <Box bg="gray.100">
    <LandingLayout>
      <Flex
        align="center"
        justify={{ base: "center", md: "space-around", xl: "space-between" }}
        direction={{ base: "column-reverse", md: "row" }}
        wrap="nowrap"
        px={8}
        my={14}
      >
        <VStack spacing={6} w="full" align="center">
          <Heading
            as="h1"
            size="lg"
            fontWeight="bold"
            textAlign={["center", "center", "left", "left"]}
          >
            Our Team
          </Heading>
          <HStack
            alignItems="start"
            spacing={8}
            wrap="wrap"
            justify={{
              base: "center",
              md: "space-around",
              xl: "space-between",
            }}
          >
            <TeamMember
              image="/noah.png"
              name="Noah Prince"
              title="Founder"
              twitter="https://twitter.com/redacted_noah"
              discord="https://discordapp.com/users/840683071496912916"
            />
            <TeamMember
              image="/bry.png"
              name="Bry Zettler"
              title="Co-Founder"
              twitter="https://twitter.com/bryzettler"
              discord="https://discordapp.com/users/471329633623605290"
            />
            <TeamMember
              image="/frank.png"
              name="Frank De Czito"
              title="Global Marketing"
            />
          </HStack>
          <HStack>
            <Box p={4} bgColor="#6FCF97" color="white" rounded="2xl" mr={2}>
              <Icon as={MatchaLogo} w={14} h={14} />
            </Box>
            <Box>
              <HStack spacing={2}>
                <Text fontSize="lg" fontWeight="bold">
                  Matcha Design Labs
                </Text>
                <Link href={"https://www.matchadesignlabs.com/"} isExternal>
                  <Icon as={RiExternalLinkLine} color="indigo.500" />
                </Link>
              </HStack>
              <Text fontSize="md">UX/Product Design Partner</Text>
            </Box>
          </HStack>
        </VStack>
      </Flex>
    </LandingLayout>
  </Box>
);
