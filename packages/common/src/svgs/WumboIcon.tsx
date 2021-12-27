import React from "react";
import { createIcon } from "@chakra-ui/react";

export const WumboIcon = createIcon({
  displayName: "Wumbo",
  viewBox: "0 0 324 324",
  path: [
    <linearGradient
      id="a"
      x1="-120.432"
      x2="87.5714"
      y1="87.4286"
      y2="-88.2854"
      gradientUnits="userSpaceOnUse"
    >
      <stop stopColor="#2323FF" />
      <stop offset=".4183" stopColor="#4F51FF" />
      <stop offset="1" stopColor="#A53EF4" />
    </linearGradient>,
    <circle cx="162" cy="162" r="162" fill="url(#a)" />,
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="36"
      d="M91.088 138.345 127.341 200l37.613-61.655L200.261 200"
    />,
    <circle
      cx="229.051"
      cy="138.338"
      r="15.338"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="3"
    />,
  ],
});
