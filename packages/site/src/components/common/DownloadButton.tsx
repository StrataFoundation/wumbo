import React from "react";
import { Button, ButtonProps } from "@chakra-ui/react";

interface IDownloadButtonProps extends ButtonProps {}

export const DownloadButton: React.FC<IDownloadButtonProps> = ({
  onClick,
  ...rest
}) => (
  <Button
    colorScheme="green"
    py="4"
    px="4"
    lineHeight="1"
    size="md"
    onClick={(e) => {
      window.open(
        "https://chrome.google.com/webstore/detail/wumbo/opmfbcncfajkanpggglkgabbfhebgikk"
      );
      if (onClick) onClick(e);
    }}
    {...rest}
  >
    Download Wumbo Now
  </Button>
);
