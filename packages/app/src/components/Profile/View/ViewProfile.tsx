import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  usePublicKey,
  useTokenBondingFromMint,
  useTokenRefForName,
} from "@strata-foundation/react";
import {
  Profile,
  Spinner,
  useQuery,
  useReverseTwitter,
  useTwitterOwner,
  useTwitterTld,
} from "wumbo-common";
import {
  Routes,
  bountyPath,
  createBountyPath,
  nftPath,
  profilePath,
  sendSearchPath,
  swapPath,
} from "../../../constants/routes";
import { AppContainer } from "../../AppContainer";
import WalletRedirect from "../../Wallet/WalletRedirect";

export const ViewProfileRoute: React.FC = () => {
  const params = useParams<{ mint: string | undefined }>();
  const { connected, publicKey } = useWallet();
  const query = useQuery();
  const name = query.get("name");
  const tld = useTwitterTld();
  const passedMintKey = usePublicKey(params.mint);
  const history = useHistory();

  const { handle: twitterHandle, loading: reverseTwitterLoading } =
    useReverseTwitter(publicKey || undefined);

  const { info: tokenRef, loading: tokenRefLoading } = useTokenRefForName(
    name || twitterHandle,
    null,
    tld
  );

  const { info: tokenBonding, loading: tokenBondingLoading } =
    useTokenBondingFromMint(passedMintKey || tokenRef?.mint);
  const { owner: twitterWallet, loading: twitterOwnerLoading } =
    useTwitterOwner(name || undefined);

  const loading =
    reverseTwitterLoading ||
    tokenRefLoading ||
    tokenBondingLoading ||
    twitterOwnerLoading;

  if (loading) {
    return <Spinner />;
  }

  if (!passedMintKey && !name && !twitterHandle) {
    if (!connected) {
      return <WalletRedirect />;
    }

    return (
      <AppContainer>
        <Box p={4}>
          It looks like you haven't claimed a token yet. To claim your token,
          navigate to your twitter profile and click the "Claim" button that
          Wum.bo inserts next to Edit Profile.
        </Box>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Profile
        relinkPath={Routes.relink.path}
        onBountyCreateClick={(mint) => history.push(createBountyPath(mint))}
        onBountyClick={(bountyMint) => history.push(bountyPath(bountyMint))}
        sendPath={sendSearchPath(tokenRef?.owner || twitterWallet || undefined)}
        collectivePath={
          tokenBonding ? profilePath(tokenBonding.baseMint) : null
        }
        editPath={Routes.editProfile.path}
        useClaimFlow={(handle) => ({
          error: undefined,
          claimLoading: false,
          linkLoading: false,
          claim: async () => {
            history.push(Routes.claim + `?handle=${handle}`);
          },
          link: async () => {
            throw new Error("Not yet supported on site");
          },
        })}
        mintKey={passedMintKey || tokenRef?.mint}
        onAccountClick={(mintKey, handle) => {
          if (handle) {
            history.push(Routes.profile.path + `?name=${handle}`);
          } else if (mintKey) {
            history.push(profilePath(mintKey));
          }
        }}
        onTradeClick={() =>
          tokenBonding &&
          history.push(
            swapPath(
              tokenBonding.publicKey,
              tokenBonding!.baseMint,
              tokenBonding!.targetMint
            )
          )
        }
        getNftLink={(token) => {
          const mint = token?.metadata?.mint;
          return mint ? nftPath(new PublicKey(mint)) : "";
        }}
      />
    </AppContainer>
  );
};
