import React, { useEffect, useState } from "react";
import AppContainer from "../../common/AppContainer";
import { PublicKey } from "@solana/web3.js";
import { useParams } from "react-router-dom";
import {
  useTokenMetadata,
  useSetMetadata,
  SetMetadataArgs,
  useWallet,
  useMint,
  Avatar,
  TokenPill,
  useReverseTwitter,
  useTwitterTokenRef,
  useAccount,
  Alert,
  Button,
  Spinner,
  useClaimedTokenRef
} from "wumbo-common";
import { SubmitHandler, useForm } from "react-hook-form";
import { TokenBondingV0 } from "spl-token-bonding";
import WalletRedirect from "../../Wallet/WalletRedirect";

export const EditProfileRoute = React.memo(() => {
  const params = useParams<{ ownerWalletKey: string }>();
  const ownerWalletKey = new PublicKey(params.ownerWalletKey);
  return (
    <AppContainer>
      <EditProfile ownerWalletKey={ownerWalletKey} />
    </AppContainer>
  );
});

export const EditProfile = React.memo(
  ({ ownerWalletKey }: { ownerWalletKey: PublicKey }) => {
    const hiddenFileInput = React.useRef<HTMLInputElement>(null);
    const { handle } = useReverseTwitter(ownerWalletKey);
    const { info: tokenRef } = useClaimedTokenRef(ownerWalletKey);
    const { watch, register, handleSubmit, setValue, reset } =
      useForm<SetMetadataArgs>({
        defaultValues: {
          founderRewardsPercent: 5,
        },
      });
    const { info: tokenBonding } = useAccount(
      tokenRef?.tokenBonding,
      TokenBondingV0.fromAccount
    );
    const { image: metadataImage, metadata } = useTokenMetadata(
      tokenBonding?.targetMint
    );
    const { name = "", symbol = "", founderRewardsPercent, image } = watch();
    useEffect(() => {
      if (metadataImage) {
        setImgUrl(metadataImage);
      }
      reset({
        name: metadata?.data.name || handle,
        symbol: metadata?.data.symbol || handle?.substr(0, 4).toUpperCase(),
        founderRewardsPercent: 5,
      });
    }, [tokenRef, metadata, metadataImage]);

    const { setMetadata, state, error } = useSetMetadata(tokenRef?.publicKey);
    if (error) {
      console.error(error);
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue("image", e.target.files![0] || null);
    };

    const handleOnSubmit = (values: SetMetadataArgs) => {
      setMetadata(values);
    };

    const [imgUrl, setImgUrl] = useState<string>();
    const reader = new FileReader();
    useEffect(() => {
      function loadListiner() {
        setImgUrl(reader.result?.toString());
      }
      reader.addEventListener("load", loadListiner);
      if (image) {
        reader.readAsDataURL(image);
      } else {
        setImgUrl(undefined);
      }

      return () => {
        reader.removeEventListener("load", loadListiner);
      };
    }, [image]);

    const avatar = <Avatar imgSrc={imgUrl} token name={symbol} />;

    // const { watch } = useForm<EditProfileFormValues>();
    // const { ticker, founderRewardsPercent, image } = watch()
    return (
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <WalletRedirect />
        <div>
          <span className="text-md mb-2">Preview</span>
          {tokenRef && tokenBonding && (
            <TokenPill
              name={name}
              ticker={symbol}
              icon={avatar}
              tokenBonding={tokenBonding}
            />
          )}
        </div>
        <div className="mt-3">
          <span className="text-md">Settings</span>
          <div className="px-2 py-2 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Photo
              </label>
              <div className="mt-1 flex items-center">
                {avatar}
                <button
                  type="button"
                  // Programatically click the hidden file input element
                  // when the Button component is clicked
                  onClick={() => hiddenFileInput.current!.click()}
                  className="ml-3 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Choose
                </button>
                <input
                  accept=".png,.jpg"
                  id="image"
                  type="file"
                  onChange={handleImageChange}
                  ref={hiddenFileInput}
                  style={{ display: "none" }}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <div className="mt-1">
                <input
                  required
                  {...register("name")}
                  className="p-2 shadow-sm mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                  placeholder="My Awesome Coin"
                  defaultValue={""}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                The name for your token.
              </p>
            </div>
            <div>
              <label
                htmlFor="ticker"
                className="block text-sm font-medium text-gray-700"
              >
                Symbol
              </label>
              <div className="mt-1">
                <input
                  required
                  {...register("symbol")}
                  className="p-2 shadow-sm mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                  placeholder="NXX2"
                  defaultValue={""}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                The short name for your token. For example, WUM is the token of
                Wum.bo.
              </p>
            </div>

            <div>
              <label
                htmlFor="founderRewardsPercent"
                className="block text-sm font-medium text-gray-700"
              >
                Royalties
              </label>
              <div className="mt-1">
                <input
                  required
                  {...register("founderRewardsPercent")}
                  className="shadow-sm mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                  type="number"
                  min={0}
                  step={0.1}
                  placeholder="5"
                  defaultValue={""}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                A percentage of coin sales that will be sent to your wallet. We
                recommend keeping this less than 10%.
              </p>
            </div>
          </div>
          {error && <Alert type="error" message={error.toString()} />}
          <div className="px-2 py-3 text-right sm:px-2">
            <Button
              block
              className="mt-2"
              color="primary"
              submit
              // className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={state != "idle"}
            >
              {state != "idle" && (
                <div className="mr-4">
                  <Spinner size="sm" />
                </div>
              )}
              {state === "idle" && "Save"}
              {state === "submit-solana" && "Sending to Solana"}
              {state === "submit-arweave" && "Uploading to Arweave"}
              {state === "gathering-files" && "Gathering Files"}
              {state === "awaiting-approval" && "Awaiting Approval"}
            </Button>
          </div>
        </div>
      </form>
    );
  }
);
