import React, { useEffect } from 'react';
import AppContainer from '../../common/AppContainer';
import { PublicKey } from '@solana/web3.js';
import { useParams } from 'react-router-dom';
import { Avatar, TokenPill, useReverseTwitter, useCreator, useAccount } from "wumbo-common";
import { SubmitHandler, useForm } from "react-hook-form";
import { TokenBondingV0 } from 'spl-token-bonding';

export type EditProfileFormValues = {
  ticker: string | undefined;
  founderRewardsPercent: number;
  image: File | undefined;
};

export const EditProfileRoute = React.memo(() => {
  const params = useParams<{ ownerWalletKey: string }>();
  const ownerWalletKey = new PublicKey(params.ownerWalletKey)
  return <AppContainer>
    <EditProfile ownerWalletKey={ownerWalletKey} />
  </AppContainer>
})

export const EditProfile = React.memo(({ ownerWalletKey }: { ownerWalletKey: PublicKey }) => {
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);
  const { handle } = useReverseTwitter(ownerWalletKey);
  const { info: creator } = useCreator(handle);
  const { watch, register, handleSubmit, reset } = useForm<EditProfileFormValues>({
    defaultValues: {
      founderRewardsPercent: 5,
    }
  });
  const { ticker = "", founderRewardsPercent, image } = watch();
  useEffect(() => {
    reset({
      ticker: handle?.substr(0, 4).toUpperCase(),
      founderRewardsPercent: 5,
    })
  }, [creator]);

  const { info: tokenBonding } = useAccount(creator?.tokenBonding, TokenBondingV0.fromAccount)

  // const { watch } = useForm<EditProfileFormValues>();
  // const { ticker, founderRewardsPercent, image } = watch()
  return <form>
    <div>
      <span className="text-md mb-2">Preview</span>
      {creator && tokenBonding && <TokenPill
        name={"@" + handle}
        ticker={ticker}
        icon={<Avatar token name={ticker} />}
        tokenBonding={tokenBonding}
      />}
    </div>
    <div className="mt-3">
      <span className="text-md">Settings</span>
      <div className="px-2 py-2 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Photo</label>
          <div className="mt-1 flex items-center">
            <Avatar token name={ticker} />
            <button
              // Programatically click the hidden file input element
              // when the Button component is clicked
              onClick={() => hiddenFileInput.current!.click()}
              className="ml-3 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Choose
            </button>
            <input
              {...register("image")}
              type="file"
              ref={hiddenFileInput}
              style={{ display: 'none' }}
            />
          </div>
        </div>
        <div>
          <label htmlFor="ticker" className="block text-sm font-medium text-gray-700">
            Ticker
          </label>
          <div className="mt-1">
            <input
              {...register("ticker")}
              className="p-2 shadow-sm mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
              placeholder="NXX2"
              defaultValue={''}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            The short name for your token. For example, WUM is the token of Wum.bo.
          </p>
        </div>
        <div>
          <label htmlFor="founderRewardsPercent" className="block text-sm font-medium text-gray-700">
            Royalties
          </label>
          <div className="mt-1">
            <input
              {...register("founderRewardsPercent")}
              className="shadow-sm mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
              type="number"
              min={0}
              step={0.1}
              placeholder="5"
              defaultValue={''}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            A percentage of coin sales that will be sent to your wallet. We recommend keeping this less than 10%.
          </p>
        </div>
      </div>
      <div className="px-4 py-3 text-right sm:px-6">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save
        </button>
      </div>
    </div>
  </form>
})