import React from "react";

import "./Token.css";

interface TokenProps {
  name: string;
  size?: "large" | "small";
  src?: string;
}

export function Token({ name, size = "large", src }: TokenProps) {
  return (
    <div
      className={`token-display token-display-${size} ${src && "token-src"}`}
    >
      <div className="token-display-icon">
        {src ? <img src={src} /> : <span>{name.substr(0, 2)}</span>}
      </div>
      <span className="token-display-name">{name}</span>
    </div>
  );
}
