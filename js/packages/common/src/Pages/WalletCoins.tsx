import React from "react";
import { PublicKey } from "@solana/web3.js";
import { RiCoinLine } from "react-icons/ri";
import { Avatar } from "../";
import WumLogo from "../svgs/logo.svg";
import SolLogo from "../svgs/sol.svg";

interface WalletCoinsProps {
  publicKey: PublicKey;
}

export const WalletCoins = ({ publicKey }: WalletCoinsProps) => {
  // getWum
  // getSol
  // getWumTokens

  const tokens = [
    {
      publicKey: PublicKey.default,
      metadata: { name: "Test1", symbol: "tst1" },
    },
    {
      publicKey: PublicKey.default,
      metadata: { name: "Test1", symbol: "tst1" },
    },
    {
      publicKey: PublicKey.default,
      metadata: { name: "Test1", symbol: "tst1" },
    },
  ];
  return (
    <div className="flex flex-col">
      <div className="flex justify-around divide-x divide-gray-200 border-b-1">
        <div className="p-4 flex-1 flex flex-col gap-1 items-center hover:bg-gray-100 hover:cursor-pointer">
          <Avatar imgSrc={WumLogo} />
          <div className="flex gap-2 items-center leading-normal">
            <RiCoinLine size="16" />
            <p>0 WUM</p>
          </div>
          <p className="text-gray-400 font-light">(~ $830.44)</p>
        </div>
        <div className="p-4 flex-1 flex flex-col gap-1 items-center hover:bg-gray-100 hover:cursor-pointer">
          <Avatar imgSrc={SolLogo} />
          <div className="flex gap-2 items-center leading-normal">
            <RiCoinLine size="16" />
            <p>12000.34 SOL</p>
          </div>
          <p className="text-gray-400 font-light">(~ $2,343,120.23)</p>
        </div>
      </div>
      <ul role="list" className="grid grid-cols-1 divide-y divide-gray-200">
        {tokens.map((token) => (
          <li
            key={token.publicKey?.toBase58()}
            className="p-4 flex items-center py-4 hover:bg-gray-100 hover:cursor-pointer"
          >
            <div className="flex gap-4">
              <Avatar imgSrc={WumLogo} subText="53.23 SBOB (~$17.45)" />
              <div className="flex flex-col">
                <p>Spongebob Squarepants</p>
                <div className="flex gap-1 items-center text-sm leading-normal">
                  <RiCoinLine size="16" />
                  <p>
                    53.23 SBOB{" "}
                    <span className="text-gray-400 font-light">(~$17.45)</span>
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
