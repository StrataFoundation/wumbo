import React from "react";
import { Token } from "./Token";

import "./CreatorViewInfoHeader.css";

interface CreatorViewInfoHeaderProps {
  creatorImg: string;
  creatorName: string;
  creatorPrice: number;
}

export function CreatorViewInfoHeader({
  creatorImg,
  creatorName,
  creatorPrice,
}: CreatorViewInfoHeaderProps) {
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
          <span className="subdetails-key">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAMAAACecocUAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACBUExURUdwTNfY2ObDYOzBO72QMdqrIfLXX76levHQSQAu/+zixem/J/TWeLiLNO7HOrqMIriRStChIauHRcuaIbqSOJpyK6eEQraGRdy5a8qeNPrhNtKxWPfOHPrYQfbJONSsOOO+R/vgReO0HsaUHNSiHtuoGvvPGdCgHvPDG+y+Hf/bFsS6aYkAAAAidFJOUwAJUK+w71QjegUN2CKPieZa7nPvxLiLiVitqYLenI7RrLyY7s45AAAAXklEQVQI1z3MVw6AIBAE0FVUwN57B0G9/wEFjM7Xm2R3AHR8sk2hEVj9Pc7oLZ4QBMhqHJ9XQIJFk6Jd5RjMicu5ZJ2vaLvScaLU0sxYgqn5awuW43caSlZ/hKb6+QB5gwU0Rq9Q3gAAAABJRU5ErkJggg==" />
            YOD3aM4N..
          </span>
        </div>
      </div>
    </div>
  );
}
