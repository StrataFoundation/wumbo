import React from "react";
import { Button, ButtonProps } from "@chakra-ui/react";

interface IDownloadButtonProps extends ButtonProps {}

export const DownloadButton: React.FC<IDownloadButtonProps> = ({ ...rest }) => (
  <Button
    colorScheme="green"
    py="4"
    px="4"
    lineHeight="1"
    size="md"
    onClick={() =>
      window.open(
        "https://chrome.google.com/webstore/detail/wumbo/opmfbcncfajkanpggglkgabbfhebgikk"
      )
    }
    {...rest}
  >
    Download Wumbo Now
  </Button>
);
