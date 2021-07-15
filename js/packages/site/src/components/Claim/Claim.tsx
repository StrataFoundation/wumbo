import React, { useEffect, useState } from "react";
import AppContainer from "../common/AppContainer";
import { Redirect } from "react-router";
import routes from "../../constants/routes";
import { claimTwitterTransaction, useQuery, useWallet } from "wumbo-common";
import { useLocation, useHistory } from "react-router-dom";
import TwitterButton from "../BetaSplash/TwitterButton";
import { auth0, auth0Options } from "wumbo-common";
import Claiming from "./Claiming";
import { Transaction, Connection } from "@solana/web3.js";
import { useAsyncCallback } from "react-async-hook";
import { useConnection, useLocalStorageState } from "@oyster/common";
import { WalletAdapter } from "@solana/wallet-base";

function makeId(length: number): string {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

interface ClaimState {
    loading: boolean;
    error: Error | undefined;
    execute: (twitterHandle: string) => void
}

function useClaim(): ClaimState {
    const connection = useConnection();
    const { wallet } = useWallet();
    const setTransaction = useLocalStorageState("claim-txn")[1];
    const setAuth0State = useLocalStorageState("auth0-state")[1];
    const setRedirectUri = useLocalStorageState("redirect-uri")[1];
    const setTwitterHandle = useLocalStorageState("twitter-handle")[1];
    
    const history = useHistory();
    const location = useLocation();

    async function exec(twitterHandle: string) {
        if (wallet) {
            const state = makeId(6);
            setAuth0State(state);
            setTwitterHandle(twitterHandle)
            setRedirectUri(window.location.href);
            const transaction = await claimTwitterTransaction(connection, {
                wallet,
                twitterHandle
            });
            setTransaction(transaction.serialize({
                requireAllSignatures: false,
                verifySignatures: false,
            }));

            const auth0Url = auth0.client.buildAuthorizeUrl({
                ...auth0Options,
                scope: 'openid profile',
                redirectUri: window.location.href,
                responseType: 'code',
                state,
            })
            window.location.href = auth0Url
        }
    }
    const { execute, loading, error } = useAsyncCallback(exec);

    return {
        loading,
        error,
        execute
    }
}

export default React.memo(() => {
    const { connected } = useWallet();
    const location = useLocation();
    const query = useQuery();
    const [twitterHandle, setTwitterHandle] = useState<string>("");
    const redirectUri = routes.wallet.path + `?redirect=${location.pathname}${location.search}`;
    const { execute, error, loading } = useClaim();

    if (error) {
        console.error(error)
    }

    if (!connected) {
        return <Redirect to={redirectUri} />
    }

    const code = query.get("code");
    if (code) {
        return <AppContainer>
            <Claiming code={code} />
        </AppContainer>
    }

    return <AppContainer>
        <input 
            value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)}
            placeholder="Twitter Handle"
            className="border-1 border-grey-300 rounded-lg hover:bg-grey-300"
        />

        <TwitterButton loading={loading} onClick={() => execute(twitterHandle)}>Sign in to Claim</TwitterButton>
    </AppContainer>
})