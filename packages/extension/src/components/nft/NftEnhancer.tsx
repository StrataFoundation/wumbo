import React, { Fragment, useState } from "react";
import ReactShadow from "react-shadow/emotion";
import { Box } from "@chakra-ui/react";
import {
  FloatPortal,
  pxToNum,
  NftBadgeIcon,
  NftBadgeHoverIcon,
  ThemeProvider,
} from "wumbo-common";
import { useNfts } from "../../utils/nftSpotter";
import { useDrawer } from "@/contexts/drawerContext";
import { useHistory } from "react-router-dom";
import { nftPath } from "@/constants/routes";
import { PublicKey } from "@solana/web3.js";

const NftBadge = ({
  mintKey,
  dimension,
}: {
  mintKey: string;
  dimension: any;
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const { toggleDrawer } = useDrawer();
  const history = useHistory();
  const dimensionPx = `${dimension}px`;

  return (
    <Box
      position="absolute"
      bottom={`-${Math.floor(dimension / 4)}px`}
      right={`-${Math.floor(dimension / 4)}px`}
      pointerEvents="auto"
      _hover={{ cursor: "pointer" }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDrawer({ isOpen: true });
        history.push(nftPath(new PublicKey(mintKey)));
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {!isHovering && <NftBadgeIcon width={dimensionPx} height={dimensionPx} />}
      {isHovering && <NftBadgeHoverIcon width={dimensionPx} height={dimensionPx} />}
    </Box>
  );
};

export const NftEnhancer: React.FC = () => {
  const nfts = useNfts();

  if (nfts) {
    return (
      <Fragment>
        {nfts.map((nft) => {
          const imgStyle = getComputedStyle(nft.img);
          const dimension = Math.min(
            0.4 * Math.max(pxToNum(imgStyle.height), pxToNum(imgStyle.width)),
            30
          );
          return (
            <FloatPortal
              key={nft.img.id}
              container={nft.img}
              clearance={{ top: 1, right: 1 }}
            >
              <ReactShadow.div>
                <ThemeProvider>
                  <NftBadge key={nft.img.id} mintKey={nft.mintKey} dimension={dimension} />
                </ThemeProvider>
              </ReactShadow.div>
            </FloatPortal>
          );
        })}
      </Fragment>
    );
  }

  return null;
};
