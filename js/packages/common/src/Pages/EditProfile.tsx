import React, { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useParams } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { TokenBondingV0 } from "@wum.bo/spl-token-bonding";
import { useReverseTwitter } from "../utils/twitter";
import { useClaimedTokenRef } from "../utils/tokenRef";
import {
  SetMetadataArgs,
  useSetMetadata,
  useTokenMetadata,
} from "../utils/metaplex";
import { useAccount } from "../utils/account";
import { TokenPill } from "../TokenPill";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { Alert } from "../Alert";
import { Spinner } from "../Spinner";
import { TokenBonding } from "../utils/deserializers/spl-token-bonding";
import { handleErrors, useWallet } from "../contexts";

interface IEditProfileProps {
  ownerWalletKey: PublicKey;
  onComplete(completeArgs: { metadataAccount: PublicKey }): void;
}

export const EditProfile = React.memo(
  ({ ownerWalletKey, onComplete }: IEditProfileProps) => {
    const hiddenFileInput = React.useRef<HTMLInputElement>(null);
    const { awaitingApproval } = useWallet();
    const { info: tokenRef } = useClaimedTokenRef(ownerWalletKey);
    const { watch, register, handleSubmit, setValue, reset } =
      useForm<SetMetadataArgs>({
        defaultValues: {
          founderRewardsPercent: 5,
        },
      });
    const { info: tokenBonding } = useAccount(
      tokenRef?.tokenBonding,
      TokenBonding
    );

    const {
      image: metadataImage,
      metadata,
      error: tokenMetadataError,
    } = useTokenMetadata(tokenBonding?.targetMint);
    const { name = "", symbol = "", founderRewardsPercent, image } = watch();
    const { setMetadata, state, error } = useSetMetadata(tokenRef?.publicKey);

    handleErrors(tokenMetadataError, error);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue("image", e.target.files![0] || null);
    };

    const handleOnSubmit = async (values: SetMetadataArgs) => {
      const result = await setMetadata(values);
      if (result) {
        onComplete(result);
      }
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

    useEffect(() => {
      if (metadataImage) {
        setImgUrl(metadataImage);
      }
      console.log(metadata);
      reset({
        name: metadata?.data.name,
        symbol: metadata?.data.symbol,
        founderRewardsPercent:
          (tokenBonding?.targetRoyaltyPercentage || 0) / 4294967295,
      });
    }, [metadata?.data.name, metadata?.data.symbol, metadataImage]);

    const avatar = <Avatar src={imgUrl} name={symbol} />;

    // const { watch } = useForm<EditProfileFormValues>();
    // const { ticker, founderRewardsPercent, image } = watch()
    return (
      <form onSubmit={handleSubmit(handleOnSubmit)}>
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
                  title="Royalties editing is disabled for beta"
                  disabled
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
          <div className="py-3 text-right">
            <Button
              block
              className="mt-2"
              color="primary"
              submit
              disabled={state != "idle"}
            >
              {state != "idle" && (
                <div className="mr-4">
                  <Spinner size="sm" />
                </div>
              )}
              {!awaitingApproval && (
                <>
                  {state === "idle" && "Save"}
                  {state === "submit-solana" && "Sending to Solana"}
                  {state === "submit-arweave" && "Uploading to Arweave"}
                  {state === "gathering-files" && "Gathering Files"}
                </>
              )}
              {awaitingApproval && "Awaiting Approval"}
            </Button>
          </div>
        </div>
      </form>
    );
  }
);
