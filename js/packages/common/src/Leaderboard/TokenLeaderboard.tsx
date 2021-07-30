import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Spinner } from '../Spinner';
import { AccountInfo as TokenAccountInfo } from '@solana/spl-token';
import { PublicKey, Connection } from '@solana/web3.js';
import { Leaderboard, LeaderboardNumber, MetadataLeaderboardElement } from '../Leaderboard';
import { amountAsNum, useMint, useOwnedAmount, useWallet } from '../utils';
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import { TokenAccountParser, useConnection } from "@oyster/common";
import { useAsync } from 'react-async-hook';
import { TOKEN_PROGRAM_ID } from '../constants/globals';

const WhiteCard = ({ children = null as any }) => (
  <div className="bg-white rounded-md shadow-md border-1">
    {children}
  </div>
)

const PageChevron = ({ direction, onClick }: { direction: "up" | "down", onClick?: () => void }) => (
  <div className="hover:bg-gray-100 hover:cursor-pointer w-full flex flex-col items-center">
    {direction == "up" && <ChevronUpIcon onClick={onClick} className="h-4 w-4 text-indigo-600" />}
    {direction == "down" && <ChevronDownIcon onClick={onClick} className="h-4 w-4 text-indigo-600" />}
  </div>
)

const TokenAccountsContext = React.createContext<{ accounts: AccountAndRank[], loading: boolean }>({ accounts: [], loading: true });

async function getAllTokenAccounts(connection: Connection, mint: PublicKey | undefined): Promise<AccountAndRank[]> {
  if (mint) {
    // @ts-ignore
    const vals = (await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
      filters: [{
        memcmp: {
          bytes: mint.toBase58(),
          offset: 0
        }
      }]
    }))
      .map(({ account, pubkey }) => TokenAccountParser(pubkey, account).info)
      .sort((a, b) => b.amount.toNumber() - a.amount.toNumber())
      .map((account, index) => ({
        rank: index + 1,
        account
      }))

    return vals;
  }

  return []
}

export function TokenAccountsContextProvider({ children = null as any, mint }: { children: any, mint: PublicKey | undefined }): React.ReactElement {
  const connection = useConnection();
  const { result: accounts, loading, error } = useAsync(getAllTokenAccounts, [connection, mint])

  if (error) {
    console.error(error);
  }

  return <TokenAccountsContext.Provider
    value={{
      accounts: accounts || [],
      loading
    }}
  >
    {children}
  </TokenAccountsContext.Provider>
}

export function useTokenAccounts(): { loading: boolean, accounts: AccountAndRank[] } {
  return useContext(TokenAccountsContext);
}

type AccountAndRank = {
  rank: number;
  account: TokenAccountInfo;
}
interface IAccountsPagination {
  loading: boolean;
  accounts: AccountAndRank[];
  pageUp(): void;
  pageDown(): void;
}
function zeroMin(input: number): number {
  return input < 0 ? 0 : input;
}
function idxMax(input: number, index: number) {
  return input > index ? index : input;
}
function useAccountsPagination(mintKey: PublicKey | undefined, findAmount?: number): IAccountsPagination {
  const { accounts: accountsIn, loading } = useTokenAccounts();
  const [startIndex, setStartIndex] = useState<number>(0);
  const [stopIndex, setStopIndex] = useState<number>(5);
  const mint = useMint(mintKey)

  useEffect(() => {
    if (findAmount) {
      setStartIndex(0);
    } else {
      const index = accountsIn.findIndex(v => mint && amountAsNum(v.account.amount, mint));
      setStartIndex(index);
    }
  }, [findAmount, accountsIn])
  const accounts = React.useMemo(() => accountsIn.slice(startIndex, stopIndex), [accountsIn, startIndex, stopIndex]);

  return {
    accounts,
    loading,
    pageUp: () => setStartIndex((startIndex) => zeroMin(startIndex - 5)),
    pageDown: () => setStopIndex((stopIndex) => idxMax(stopIndex + 5, accountsIn.length))
  }
}

export const TokenLeaderboard = React.memo(({ mint, onAccountClick }: { mint: PublicKey, onAccountClick?: (tokenBondingKey: PublicKey) => void }) => {
  const ownedAmount = useOwnedAmount(mint)
  const top = useAccountsPagination(mint);
  const local = useAccountsPagination(mint, ownedAmount);
  const { accounts } = useTokenAccounts();
  const { wallet } = useWallet();
  const userIndex = accounts.findIndex(a => a.account.owner.toBase58() == wallet?.publicKey?.toBase58())

  if (top.loading || local.loading) {
    return <div className="flex flex-col items-center flex-grow">
      <Spinner color="primary" size="lg" />
    </div>
  }

  if (accounts.length === 0) {
    return <div>
      No token holders
    </div>
  }

  const localLeaderboard = <Fragment>
    <div className="text-center text-bold text-2xl text-gray-500 mb-2">
      ...
    </div>
    <WhiteCard>
      <PageChevron direction="up" onClick={local.pageUp} />
      <Leaderboard
        numbers={local.accounts.map(({ rank, account }) => <LeaderboardNumber selected={account.owner.toBase58() == wallet?.publicKey?.toBase58()} key={"num" + rank}>{rank}</LeaderboardNumber>)}
        elements={local.accounts.map(({ rank, account }) => <MetadataLeaderboardElement onClick={onAccountClick} key={"el" + rank} account={account} />)}
      />
      <PageChevron direction="down" onClick={local.pageDown} />
    </WhiteCard>
  </Fragment>

  return <div className="pt-2 flex flex-col items-stretch">
    <WhiteCard>
      <Leaderboard
        numbers={top.accounts.map(({ rank, account }) => <LeaderboardNumber selected={account.owner.toBase58() == wallet?.publicKey?.toBase58()} key={"num" + rank}>{rank}</LeaderboardNumber>)}
        elements={top.accounts.map(({ rank, account }) => <MetadataLeaderboardElement onClick={onAccountClick} key={"el" + rank} account={account} />)}
      />
      <PageChevron direction="down" onClick={top.pageDown} />
    </WhiteCard>
    { userIndex > (top.accounts.length - 1) && localLeaderboard}
  </div>
})