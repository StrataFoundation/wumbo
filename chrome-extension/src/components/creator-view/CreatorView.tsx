import React from "react";
import { Tabs } from "antd";
import { CreatorInfoState } from "../../utils/creatorState";
import { CreatorViewInfoHeader } from "./CreatorViewInfoHeader";
import { CoinDetails } from "./CoinDetails";
import Loading from "../Loading";
import Buy from "./Buy";
import Sell from "./Sell";

import "./CreatorView.css";
import GetWUM from "./GetWUM";

const { TabPane } = Tabs;

interface CreatorViewProps {
  creatorImg: string;
}

export default ({
  creatorInfo,
  creatorImg,
  loading,
}: CreatorInfoState & CreatorViewProps) => {
  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <CreatorViewInfoHeader
        creatorImg={creatorImg}
        creatorName={creatorInfo?.name || ""}
        creatorPrice={creatorInfo?.coinPriceUsd || 0.0}
      />
      <CoinDetails />
      <div className="creator-view-width-constraint">
        <Tabs defaultActiveKey="buy">
          {creatorInfo?.creator && (
            <>
              <TabPane tab="Buy" key="buy">
                <Buy creatorInfo={creatorInfo} />
              </TabPane>
              <TabPane tab="Sell" key="sell">
                <Sell creatorInfo={creatorInfo} />
              </TabPane>
              <TabPane tab="Get WUM" key="wum">
                <GetWUM />
              </TabPane>
            </>
          )}
        </Tabs>
      </div>
    </>
  );
};
