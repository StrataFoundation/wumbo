import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Flex,
  Image,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { RiTwitterFill, RiDiscordFill } from "react-icons/ri";
import { LandingLayout } from "../layouts/LandingLayout";

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
  <VStack>
    <Box w={{ base: "140px", md: "180px" }} h={{ base: "140px", md: "180px" }}>
      <Image w="100%" h="100%" objectFit="cover" rounded="lg" src={image} />
    </Box>
    <Text fontSize="lg" fontWeight="bold">
      {name}
    </Text>
    <Text fontSize="">{title}</Text>
    <HStack>
      {twitter && (
        <Link to={{ pathname: twitter }} target="_blank">
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
        <Link to={{ pathname: discord }} target="_blank">
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
              image={process.env.PUBLIC_URL + "noah.png"}
              name="Noah Prince"
              title="Founder"
              twitter="https://twitter.com/redacted_noah"
              discord="https://discordapp.com/users/840683071496912916"
            />
            <TeamMember
              image={process.env.PUBLIC_URL + "bry.png"}
              name="Bry Zettler"
              title="Co-Founder"
              twitter="https://twitter.com/bryzettler"
              discord="https://discordapp.com/users/471329633623605290"
            />
            <TeamMember
              image={process.env.PUBLIC_URL + "frank.png"}
              name="Frank De Czito"
              title="Global Marketing"
            />
          </HStack>
        </VStack>
      </Flex>
    </LandingLayout>
  </Box>
);
