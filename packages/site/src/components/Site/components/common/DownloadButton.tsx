import React from "react";
import { Link } from "react-router-dom";
import { Button, ButtonProps } from "@chakra-ui/react";

interface IDownloadButtonProps extends ButtonProps {}

export const DownloadButton: React.FC<IDownloadButtonProps> = ({ ...rest }) => (
  <Link
    to={{
      pathname:
        "https://chrome.google.com/webstore/detail/wumbo/opmfbcncfajkanpggglkgabbfhebgikk",
    }}
    target="_blank"
  >
    <Button
      colorScheme="green"
      py="4"
      px="4"
      lineHeight="1"
      size="md"
      {...rest}
    >
      Download Wumbo Now
    </Button>
  </Link>
);
