import React from 'react';
import { PublicKey } from '@solana/web3.js';
import { useParams } from 'react-router';
import AppContainer from '../../common/AppContainer';
import { Profile, Spinner, useClaimedTokenRef, useWallet, useWumbo } from "wumbo-common";
import { useHistory } from 'react-router-dom';
import { profilePath } from '../../../constants/routes';
import WalletRedirect from '../../Wallet/WalletRedirect';

export const ViewProfileRoute = React.memo(() => {
  const params = useParams<{ tokenBondingKey: string | undefined }>();
  const { wallet, connected } = useWallet();
  const { info: tokenRef, loading } = useClaimedTokenRef(wallet?.publicKey || undefined);
  const history = useHistory();

  let tokenBondingKey: PublicKey;
  if (params.tokenBondingKey) {
    tokenBondingKey = new PublicKey(params.tokenBondingKey);
  } else {
    if (!connected) {
      return <WalletRedirect />
    }

    if (loading) {
      return <AppContainer>
        <Spinner />
      </AppContainer>
    }

    tokenBondingKey = tokenRef!.tokenBonding
  }


  return (
    <AppContainer>
      <Profile
        tokenBondingKey={tokenBondingKey}
        onAccountClick={(tokenBondingKey: PublicKey) => {
          history.push(profilePath(tokenBondingKey))
        }}
      />
    </AppContainer>
  );
});
