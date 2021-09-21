import React from "react";
import { createIcon } from "@chakra-ui/react";

export const NftBadgeIcon = createIcon({
  displayName: "NftBadge",
  viewBox: "0 0 40 40",
  path: [
    <g filter="url(#a)">
      <circle
        cx="20"
        cy="16"
        r="15.5"
        fill="url(#b)"
        stroke="#fff"
        stroke-dasharray="2 2"
      />
    </g>,
    <path
      fill="#fff"
      d="m25.3886 18.1332.8013.4807a.333.333 0 0 1 .1188.4504.333.333 0 0 1-.1188.1216l-5.8466 3.508a.6668.6668 0 0 1-.6867 0l-5.8467-3.508a.3335.3335 0 0 1 0-.572l.8014-.4807 5.3886 3.2333 5.3887-3.2333Zm0-3.1333.8013.4807a.3333.3333 0 0 1 0 .572l-6.19 3.714-6.19-3.714a.333.333 0 0 1-.1621-.286.3333.3333 0 0 1 .1621-.286l.8014-.4807 5.3886 3.2333 5.3887-3.2333Zm-5.046-6.1273 5.8473 3.508a.3333.3333 0 0 1 0 .572l-6.19 3.714-6.19-3.714a.333.333 0 0 1-.1621-.286.3333.3333 0 0 1 .1621-.286l5.8467-3.508a.6667.6667 0 0 1 .6867 0h-.0007Zm-.3427 1.3486-4.0753 2.4454 4.0753 2.4453 4.0754-2.4453-4.0754-2.4454Z"
    />,
    <defs>
      <linearGradient
        id="b"
        x1="33.037"
        x2="8.7407"
        y1="5.3333"
        y2="27.2593"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#6F27E6" />
        <stop offset="1" stop-color="#5856EB" />
      </linearGradient>
      <filter
        id="a"
        width="40"
        height="40"
        x="0"
        y="0"
        color-interpolation-filters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy="4" />
        <feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
      </filter>
    </defs>,
  ],
});

export const NftBadgeHoverIcon = createIcon({
  displayName: "NftBadgeHover",
  viewBox: "0 0 40 40",
  path: [
    <g filter="url(#a)">
      <circle
        cx="20"
        cy="16"
        r="15.5"
        fill="url(#b)"
        stroke="#fff"
        stroke-dasharray="2 2"
      />
    </g>,
    <path
      fill="#fff"
      d="m25.3886 18.1332.8013.4807a.333.333 0 0 1 .1188.4504.333.333 0 0 1-.1188.1216l-5.8466 3.508a.6668.6668 0 0 1-.6867 0l-5.8467-3.508a.3335.3335 0 0 1 0-.572l.8014-.4807 5.3886 3.2333 5.3887-3.2333Zm0-3.1333.8013.4807a.3333.3333 0 0 1 0 .572l-6.19 3.714-6.19-3.714a.333.333 0 0 1-.1621-.286.3333.3333 0 0 1 .1621-.286l.8014-.4807 5.3886 3.2333 5.3887-3.2333Zm-5.046-6.1273 5.8473 3.508a.3333.3333 0 0 1 0 .572l-6.19 3.714-6.19-3.714a.333.333 0 0 1-.1621-.286.3333.3333 0 0 1 .1621-.286l5.8467-3.508a.6667.6667 0 0 1 .6867 0h-.0007Zm-.3427 1.3486-4.0753 2.4454 4.0753 2.4453 4.0754-2.4453-4.0754-2.4454Z"
    />,
    <circle cx="20" cy="16" r="16" fill="#000" fill-opacity=".3" />,
    <defs>
      <linearGradient
        id="b"
        x1="33.037"
        x2="8.7407"
        y1="5.3333"
        y2="27.2593"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#6F27E6" />
        <stop offset="1" stop-color="#5856EB" />
      </linearGradient>
      <filter
        id="a"
        width="40"
        height="40"
        x="0"
        y="0"
        color-interpolation-filters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy="4" />
        <feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
      </filter>
    </defs>,
  ],
});
