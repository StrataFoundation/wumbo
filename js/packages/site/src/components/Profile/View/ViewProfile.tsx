import React from 'react';
import { PublicKey } from '@solana/web3.js';
import { useParams } from 'react-router';
import AppContainer from '../../common/AppContainer';
import { Profile } from "wumbo-common";
import { AccountInfo as TokenAccountInfo } from '@solana/spl-token';
import { useHistory } from 'react-router-dom';
import routes from '../../../constants/routes';

export const ViewProfileRoute = React.memo(() => {
  const params = useParams<{ ownerWalletKey: string }>();
  const ownerWalletKey = new PublicKey(params.ownerWalletKey);
  const history = useHistory();

  return (
    <AppContainer>
      <Profile
        ownerWalletKey={ownerWalletKey}
        onAccountClick={(account) => history.push(routes.profile.path.replace(":ownerWalletKey", account.owner.toBase58()))}
      />
    </AppContainer>
  );
});
