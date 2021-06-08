import React from "react"
import { Token } from "./Token"

import "./CreatorViewInfoHeader.css"

interface CreatorViewInfoHeaderProps {
  creatorImg: string
  creatorName: string
  creatorPrice: number
  details: any
}

export function CreatorViewInfoHeader({
  creatorImg,
  creatorName,
  creatorPrice,
  details,
}: CreatorViewInfoHeaderProps) {
  let { showDetails, setShowDetails } = details
  return (
    <div className="creator-view-info-header">
      <div className="creator-view-info-column">
        <img src={creatorImg} className="creator-view-info-header-img" />
      </div>
      <div className="creator-view-info-column">
        <div className="creator-view-info-header-details">
          <span className="creator-view-info-header-name">
            {"@" + creatorName}
          </span>
          <Token name="NXX2" />
          <span className="creator-view-info-header-price">
            Coin price {`$${creatorPrice.toFixed(2)}`}
          </span>
        </div>
        <div className="creator-view-info-header-subdetails">
          <span>6.4M followers</span>
          <span className="subdetails-percent">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAEAgMAAADOo5ZjAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAMUExURVvypUdwTF3zplzzp7bXEmMAAAAEdFJOU/4AP39NTkGfAAAAFElEQVQI12OIUGVI4GRoYGKo/wsADQgC5XmIHcEAAAAASUVORK5CYII=" />
            +0.48%
          </span>
          <span
            className="subdetails-toggle"
            onClick={() => {
              setShowDetails((d: boolean) => !d)
            }}
          >
            {showDetails ? "Less details" : "More details"}
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFBAMAAABlfdtYAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURUdwTP///////////////////////////////////////////////////////////0Q+7AIAAAAQdFJOUwD+tGRvQIQg18Ex6w9Zlo8y0SfKAAAAJUlEQVQI12MwY2Dg/cDgqMOQqMDALLFIjoGBIVrQAUiyT2VgAABHaARF7/S8BQAAAABJRU5ErkJggg=="
              style={{
                transform: `rotate(${showDetails ? "180deg" : "0deg"})`,
              }}
            />
          </span>
        </div>
      </div>
    </div>
  )
}
