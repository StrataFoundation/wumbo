import React from "react";
import {Tabs} from "antd";
import {CreatorInfoState} from "../utils/creatorState";
import Loading from "./Loading";
import Buy from "./actions/Buy"
import Sell from "./actions/Sell";

const { TabPane } = Tabs;

export default ({ creatorInfo, loading }: CreatorInfoState) => {
  if (loading) {
    return <Loading />
  }

  return <Tabs defaultActiveKey="buy">
    {creatorInfo?.creator &&
    <>
        <TabPane tab="Buy" key="buy">
            <Buy creator={creatorInfo?.creator}/>
        </TabPane>
        <TabPane tab="Sell" key="sell">
            <Sell creator={creatorInfo?.creator}/>
        </TabPane>
    </>
    }
  </Tabs>
}