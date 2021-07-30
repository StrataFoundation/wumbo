import { amountAsNum, classNames, useAccount, useClaimedTokenRef, useMint, useSocialTokenMetadata, useTokenMetadata, useTwitterTokenRef } from '../utils';
import React from 'react';
import { AccountInfo as TokenAccountInfo, Token } from "@solana/spl-token";
import { Spinner } from '../Spinner';
import { Avatar } from '..';

interface ILeaderboardProps {
  numbers: React.ReactElement[],
  elements: React.ReactElement[] 
}

function zip<A>(a: A[], b: A[]): A[][] {
  return a.map((k, i) => [k, b[i]]);
}

export const Leaderboard = React.memo(({ numbers, elements }: ILeaderboardProps) => {
  return <div className="flex flex-col items-stretch">
    { zip(numbers, elements).map(([ number, element ], index) =>
      <div key={number.key} className="hover:bg-gray-100 flex flex-row justify-content-stretch items-center">
        { number }
        <div className={classNames("flex-grow", index < (numbers.length - 1) && "border-gray-300 border-b-1")}>
          { element }
        </div>
      </div>
    ) }
  </div>
})