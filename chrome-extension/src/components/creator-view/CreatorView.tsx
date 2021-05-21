import React from "react";
import {Tabs} from "antd";
import {CreatorInfoState} from "../../utils/creatorState";
import {CreatorViewInfoHeader} from "./CreatorViewInfoHeader";
import {CoinDetails} from "./CoinDetails";
import Loading from "../Loading";
import Buy from "./Buy";
import Sell from "./Sell";

import "./CreatorView.css";

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
                <Buy creator={creatorInfo?.creator} />
              </TabPane>
              <TabPane tab="Sell" key="sell">
                <Sell creator={creatorInfo?.creator} />
              </TabPane>
            </>
          )}
        </Tabs>
      </div>
    </>
  );
};
