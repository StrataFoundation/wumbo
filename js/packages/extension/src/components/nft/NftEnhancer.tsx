import React, { Fragment } from "react";
import { FloatPortal, pxToNum } from "wumbo-common";
import { useNfts } from "../../utils/nftSpotter";
import { InformationCircleIcon } from "@heroicons/react/solid";
import { useDrawer } from "@/contexts/drawerContext";
import { useHistory } from "react-router-dom";
import { nftPath } from "@/constants/routes";
import { PublicKey } from "@solana/web3.js";

export const NftEnhancer: React.FC = () => {
  const nfts = useNfts();
  const { toggleDrawer } = useDrawer();
  const history = useHistory();
  
  if (nfts) {
    return <Fragment>
      {nfts.map((nft) => {
        const imgStyle = getComputedStyle(nft.img);
        const dimension = Math.min(0.3 * Math.max(pxToNum(imgStyle.height), pxToNum(imgStyle.width)), 30);
        return <FloatPortal key={nft.img.id} container={nft.img} clearance={{ top: 1, right: 1 }}>
          <div style={{ position: "absolute", top: "-1px", right: "-1px" }}>
            <InformationCircleIcon
              style={{ height: dimension, width: dimension }} className="opacity-80 hover:opacity-100 hover:cursor-pointer text-yellow-400 shadow-lg "
              onClick={() => {
                toggleDrawer({ isOpen: true });
                history.push(nftPath(new PublicKey(nft.mintKey)));
              }}
            />
          </div>
        </FloatPortal>
      })}
    </Fragment>
  }

  return null;
};
