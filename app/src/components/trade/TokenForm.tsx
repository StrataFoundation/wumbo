import React from "react";
import { Link } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { Avatar, Button } from "@/components/common";
import { CreatorInfoState } from "@/utils/creatorState";
import { useWallet } from "@/utils/wallet";
import { routes } from "@/constants/routes";
import Logo from "../../../public/assets/img/logo.svg";

type FormValues = {
  fiatAmount: number;
  tokenAmount: number;
};

interface TokenFormProps {
  type: "buy" | "sell";
  isWUM?: boolean;
  creatorInfoState?: CreatorInfoState;
  onSubmit: SubmitHandler<FormValues>;
}

export const TokenForm = ({
  type,
  onSubmit,
  isWUM = false,
}: TokenFormProps) => {
  const { wallet } = useWallet();
  const { register, handleSubmit } = useForm<FormValues>();

  const inputClasses =
    "p-0 bg-transparent border-transparent focus:shadow-none focus:border-transparent";

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
            />
            <span>NXX2</span>
          </div>
        </div>
      </div>
      <div className="flex mt-4">
        {wallet && wallet.publicKey ? (
          <Button block submit color="primary" size="lg">
            {type === "sell" ? "Sell" : "Buy"}
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
