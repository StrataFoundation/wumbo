import React from "react";
import { Flex, HStack, Text } from "@chakra-ui/react";
import twitterLogo from "../../assets/images/social/twitter-white@3x.png";
import twitterLogoBlack from "../../assets/images/social/twitter-black.png";
import discordLogo from "../../assets/images/social/discord-white@3x.png";
import discordLogoBlack from "../../assets/images/social/discord-black.png";

const Footer = React.memo(
  ({ logoColor = "white" }: { logoColor?: "black" | "white" }) => (
    <Flex
      flexDirection="column"
      paddingX={10}
      paddingY={10}
      justifyContent="center"
      alignItems="center"
    >
      <Text marginBottom={4} fontSize="md">
        Other ways to stay connected
      </Text>
      <HStack>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://twitter.com/teamwumbo"
        >
          <img
            src={logoColor == "white" ? twitterLogo : twitterLogoBlack}
            alt="twitter"
            width="30"
          />
        </a>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://discord.gg/S8wJBR2BQV"
        >
          <img
            src={logoColor == "white" ? discordLogo : discordLogoBlack}
            alt="discord"
            width="30"
          />
        </a>
      </HStack>
    </Flex>
  )
);

export default Footer;
