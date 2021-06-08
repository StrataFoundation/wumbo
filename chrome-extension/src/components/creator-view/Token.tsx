import React from "react"
import { DownOutlined } from "@ant-design/icons"

import "./Token.css"

interface TokenProps {
  name: string
  size?: "large" | "small"
  src?: string
  arrow?: boolean
}

export function Token({ name, size = "large", src, arrow }: TokenProps) {
  if (name === "WUM") {
    src =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAMAAABFjsb+AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACrUExURUdwTFdL/ZVC/GNL/WBB+UZH/1JI/mhD93ZI+2ZL/T9B/2lG/05K/5JA9j0//2pJ+3lG+npG+ZRB949C+IND+IpD+UZI/4ZE+IhD94xD+JJB9lVP/ktM/1BO/4hD+HpG+kdJ/2tJ/HBG+kRF/4ND+H5F+WFL/VxN/VdN/v///49C+d3Y/rii/ZN9/Gdc/XJm/fn4/5Fm+vDt/721/qqj/n1V+tDH/ZqY/ls++1WXiUsAAAAcdFJOUwCh/W0Y10sO/v5eB8Bejnvow47bSqHr1ei70OMV23o/AAAA5ElEQVQY01XQ2VaDMBAA0EH2AtpauqgJNBSBEHZo9f+/zExIjzqP98wOgGGZu21+fosseIRrbr30M0+Seh+5mgzGMsQ8qetXdyXfZ1mmM58UmmVR/MVItv+oNKYrvrtg0qoqu4Kxm0xMsGUMIaV0Ee13K5qsEaPEAxwJJTMXveDT2EyjLN/DhRDaTYMYOL97N9USjohfnPN5GFo1/AThVWIn+L2beaOGH2BzReyXvuqXFu9JY7BshZTimnjkTh6CiRdlpVydeTHe+/wPXwJ4oK72VwIINrbG0Al+v+oYNrENZ/3oD9oEJBED4wt3AAAAAElFTkSuQmCC"
  } else if (name === "SOL") {
    src =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAUCAYAAABvVQZ0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAE6ADAAQAAAABAAAAFAAAAACST4y2AAACq0lEQVQ4Ea2UTWsTURSG32lmmmmSaZqkKlaEiFQ34ibLdiciurGr/oDWVZei+0L/QBGhm6BbReiiKvhZF1aESnHVlfSLLrTSRNJmkkxm7h3fEzLR1lgVPOXpOffjvNx75twY6G4nOH2ZXCEXiEP2yCp5Tl6SHXKk9XF1kqyR8AjW2/ts+q52jLMPyVEih9cecL/kHbBejmTh8Oa/GUue5MNoM0FflAmx2NBpqGyWkQJ66Hqo+TMxzmmufdwAmgEHrdLcF7Eh8o7kCQbPFXBmahqlkxl8sTzU+phkMyHu07djmZt7BMwuRGKbTB0x+W+M5AkGBvMYvXYLhs7A2fHgUORzXKFEERXXFCMJbnz7HrjzJBKS1DwZk5O9IpcIEskc+jOnEIQ+NK+leEVlhGgSn3EoV9Y84eYWFyh80F7LyQrRnGNmcP3iTeiUDc8K0OhVqAs8VY2+QnYZl5cX4T+dj9IiXxCxdDQqV7fxaWsJ46MzUI4N125iP6FYtwD7vHKF8TfW6+twARv7NewtvUCoOydMi1iFDIigrzwsrhbhurs4nh2GZ/rwTd2hafHKMQ0vbiBup2BYvQi9hqSKVURshbRqJjNijVIJQaMfgamgKYZYiB6KxMwQFuOYxZ4KXJS0tGHHVkRMLt8SM2HhqjmO27m7MHMpuI6Peoo14zUbvKKbCBiHrF0VC2+moQN+jB82L1+z02dncR4zmEPKyqGeDuCleaUkfUKjwfbw+jSaFFvefoxnH2b5XDr12qTOiIgJE6SYRIp/DvtecaPBVpDOb78xtkfIndpQqHrl1rtjTmQ3GNyLBv/lbUZi4uX1/+tj7/qrEYnaDCbJOpFP9TvWuCalkf1/NPkoU0SeWplIpcXLWOZl/ReT4nczaZlkmzh961XSe8Rtw5+Sg/Yd7cQ9CuQw5/sAAAAASUVORK5CYII="
  }

  return (
    <div
      className={`token-display token-display-${size} ${src && "token-src"}`}
    >
      <div className="token-display-icon">
        {src ? <img src={src} /> : <span>{name.substr(0, 2)}</span>}
      </div>
      <span className="token-display-name">{name}</span>
      {arrow && <DownOutlined />}
    </div>
  )
}
