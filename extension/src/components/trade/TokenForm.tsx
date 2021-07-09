import React from "react";
import { Link } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { Avatar, Button, Spinner } from "@/components/common";
import { CreatorInfoState } from "@/utils/creatorState";
import { useWallet } from "@/utils/wallet";
import { routes } from "@/constants/routes";
import Logo from "../../../public/assets/img/logo.svg";

export type FormValues = {
  fiatAmount: number;
  tokenAmount: number;
};

interface TokenFormProps {
  type: "buy" | "sell";
  isWUM?: boolean;
  creatorInfoState?: CreatorInfoState;
  onSubmit: SubmitHandler<FormValues>;
  submitting?: boolean;
}

export const TokenForm = ({
  type,
  isWUM = false,
  onSubmit,
  submitting = false,
}: TokenFormProps) => {
  const { wallet, awaitingApproval } = useWallet();
  const { register, handleSubmit, setValue, reset } = useForm<FormValues>();

  const inputClasses =
    "p-0 bg-transparent border-transparent focus:shadow-none focus:border-transparent";

  const handleOnFiatChange = ({
    target: { value },
  }: {
    target: { value: string };
  }) => {
    // TODO on change of fiatAmount determine tokenAmount
    setValue("tokenAmount", +value);
  };

  const handleOnTokenChange = ({
    target: { value },
  }: {
    target: { value: string };
  }) => {
    // TODO on change of tokenAmount determine fiatAmount
    setValue("fiatAmount", +value);
  };

  const handleOnSubmit = (values: FormValues) => {
    onSubmit(values);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleOnSubmit)}>
      <div className="flex justify-between px-2 py-1 mt-4 border-1 border-gray-300 rounded-lg hover:bg-gray-100">
        <div className="flex items-center justify-center">
          {isWUM ? (
            <Logo width="30" height="30" />
          ) : (
            <Avatar name="NXX2" token size="xs" />
          )}
          <span className="flex items-center text-sm pl-2">
            {isWUM ? "WUM" : "NXX2"}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex text-xl">
            <input
              required
              className={`${inputClasses} text-xl text-right leading-none`}
              type="number"
              min={0}
              step={0.01}
              placeholder="0.00"
              {...register("fiatAmount")}
              onChange={handleOnFiatChange}
            />
            <span>$</span>
          </div>
          <div className="flex text-xs">
            <input
              required
              className={`${inputClasses} text-xs text-right leading-none`}
              type="number"
              min={0}
              step={0.01}
              placeholder="0"
              {...register("tokenAmount")}
              onChange={handleOnTokenChange}
            />
            <span>{isWUM ? "WUM" : "NXX2"}</span>
          </div>
        </div>
      </div>
      <div className="flex mt-4">
        {wallet && wallet.publicKey ? (
          <Button block submit color="primary" size="lg" disabled={submitting}>
            {submitting && (
              <div className="mr-4">
                <Spinner size="sm" />
              </div>
            )}
            {awaitingApproval && "Awaiting Approval"}
            {!awaitingApproval && (type === "sell" ? "Sell" : "Buy")}
          </Button>
        ) : (
          <Link to={routes.wallet.path} className="w-full">
            <Button block color="primary" size="lg">
              Connect Wallet
            </Button>
          </Link>
        )}
      </div>
    </form>
  );
};
