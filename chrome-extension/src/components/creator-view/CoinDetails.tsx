import React from "react";

import "./CoinDetails.css";

export function CoinDetails() {
  return (
    <div className="coin-details">
      <div className="coin-details-item">
        <span>Coins in circulation</span>
        <span>44.8190</span>
      </div>
      <div className="coin-details-item">
        <span>Total USD Locked</span>
        <span>$17.269K</span>
      </div>
      <div className="coin-details-item">
        <span>USD Market cap</span>
        <span>$51.807k</span>
      </div>
    </div>
  );
}
