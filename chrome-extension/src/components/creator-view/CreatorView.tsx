import React, { useState, useEffect } from "react"
import { Tabs, Button } from "antd"
import { CreatorInfoState } from "../../utils/creatorState"
import { CreatorViewInfoHeader } from "./CreatorViewInfoHeader"
import { CoinDetails } from "./CoinDetails"
import Loading from "../Loading"
import Buy from "./Buy"
import Sell from "./Sell"
import {
  WUMBO_INSTANCE_KEY,
  WUMBO_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TWITTER_ROOT_PARENT_REGISTRY_KEY,
  TOKEN_BONDING_PROGRAM_ID,
  SPL_NAME_SERVICE_PROGRAM_ID,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
} from "../../constants/globals"
import { createWumboCreator } from "../../wumbo-api/bindings"
import { Account } from "@solana/web3.js"
import { cache } from "@oyster/common/lib/contexts/accounts"
import { WumboCreator, WumboInstance } from "../../wumbo-api/state"

import "./CreatorView.css"
import GetWUM from "./GetWUM"
import SellWUM from "./SellWUM"
import { Banner } from "../Banner"
import { WalletSelect } from "../WalletSelect"

const { TabPane } = Tabs

interface CreatorViewProps {
  connection: any
  wallet: any
  wumboInstance: any
  creatorImg: string
  creatorName: string
}

export default ({
  connection,
  wallet,
  wumboInstance,
  creatorInfo,
  creatorImg,
  creatorName,
  loading,
}: CreatorInfoState & CreatorViewProps) => {
  if (loading) {
    return <Loading />
  }
  const [showWalletConnect, setShowWalletConnect] = useState<boolean>(false)
  const [creationLoading, setCreationLoading] = useState<boolean>(false)
  const [showDetails, setShowDetails] = useState<boolean>(false)

  useEffect(() => {
    if (wallet && wallet.publicKey) {
      setShowWalletConnect(false)
    }
  }, [wallet])

  if (showWalletConnect) {
    return <WalletSelect setShowWalletConnect={setShowWalletConnect} />
  }

  const createCreator = () => {
    setCreationLoading(true)
    createWumboCreator(connection, {
      splTokenBondingProgramId: TOKEN_BONDING_PROGRAM_ID,
      splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      splTokenProgramId: TOKEN_PROGRAM_ID,
      splWumboProgramId: WUMBO_PROGRAM_ID,
      splNameServicePogramId: SPL_NAME_SERVICE_PROGRAM_ID,
      wumboInstance: WUMBO_INSTANCE_KEY,
      payer: wallet,
      baseMint: wumboInstance.wumboMint,
      name: creatorName,
      founderRewardsPercentage: 5.5,
      nameParent: TWITTER_ROOT_PARENT_REGISTRY_KEY,
    })
      .then(async () => {
        setCreationLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setCreationLoading(false)
      })
  }

  return (
    <>
      <CreatorViewInfoHeader
        creatorImg={creatorImg}
        creatorName={creatorName || ""}
        creatorPrice={creatorInfo?.coinPriceUsd || 0.0}
        details={{ showDetails, setShowDetails }}
      />
      {creatorInfo?.creator ? (
        <>
          {showDetails && <CoinDetails creatorInfo={creatorInfo} />}
          <div className="creator-view-width-constraint">
            <Tabs defaultActiveKey="buy">
              {creatorInfo?.creator && (
                <>
                  <TabPane tab="Buy" key="buy">
                    <Buy
                      creatorInfo={creatorInfo}
                      setShowWalletConnect={setShowWalletConnect}
                    />
                  </TabPane>
                  <TabPane tab="Sell" key="sell">
                    <Sell
                      creatorInfo={creatorInfo}
                      setShowWalletConnect={setShowWalletConnect}
                    />
                  </TabPane>
                  <TabPane tab="Get WUM" key="get_wum">
                    <GetWUM setShowWalletConnect={setShowWalletConnect} />
                  </TabPane>
                  <TabPane tab="Sell WUM" key="sell_wum">
                    <SellWUM setShowWalletConnect={setShowWalletConnect} />
                  </TabPane>
                </>
              )}
            </Tabs>
          </div>
        </>
      ) : (
        <>
          <Banner />

          <div className="button-wrapper">
            <div className="creator-view-width-constraint">
              {wallet && wallet.publicKey ? (
                <Button type="primary" onClick={createCreator}>
                  {creationLoading && (
                    <Loading color="white" fontSize={12} marginRight={4} />
                  )}{" "}
                  Create Coin
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setShowWalletConnect(true)
                  }}
                  type="primary"
                >
                  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAPCAYAAAACsSQRAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAEaADAAQAAAABAAAADwAAAABRQ7riAAABPElEQVQ4EZWTsUtCURTGu2VgRYOzUzU0ZO7+AwqRBNE/0OQQTc1B/RcugrQIreLS5FCtJtrY0hKhBSah5PD6fXIv3B6V1wPfu+ec+53vnvveeWYBi6JoiaUI1hX/YeK0jTGt+L5BwJD8BE/gIU6IxUfEBwjd+PkEwSlIsrHrb/zmc+Az+X3wQ0SdXJJcA20wy3IQ1Pm9JTY4/F2dJMEZqIMBCLE8pA1wRRNb6uSWIIXiTki1z6G2TPy6yOML9PzNOfwXcXWdYOPkNOQ9MLZFWdZusAgCGQo6oApc3SH+qgvwZ1oJRp13d+yYtrOVeUQuKO5TqFmZWKFN1utgETp4o0BfU9caWREN6kAiGp5gQ6zryAh+4E/fySPOCYkKq2vT8eLrnZdYxj8HBbWnv7MJtsEQ/Gdu3MXRDTT2tW/JTln0fT8PPgAAAABJRU5ErkJggg==" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
