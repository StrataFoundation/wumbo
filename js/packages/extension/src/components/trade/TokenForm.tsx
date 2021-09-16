import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { Avatar, Button, Spinner } from "wumbo-common";
import { useWallet } from "wumbo-common";
import { routes } from "@/constants/routes";
import Logo from "../../../public/assets/img/logo.svg";

export type FormValues = {
  fiatAmount: string;
  tokenAmount: string;
};

interface TokenFormProps {
  type: "buy" | "sell";
  onSubmit: SubmitHandler<FormValues>;
  submitting?: boolean;
  icon: React.ReactElement;
  ticker: string;
  fiatAmountFromTokenAmount: (amount: number) => number;
  tokenAmountFromFiatAmount: (amount: number) => number;
}

export const TokenForm = ({
  type,
  onSubmit,
  submitting = false,
  icon,
  ticker,
  fiatAmountFromTokenAmount,
  tokenAmountFromFiatAmount,
}: TokenFormProps) => {
  const { connected, awaitingApproval } = useWallet();
  const { register, handleSubmit, setValue, reset, watch } = useForm<FormValues>();

  const inputClasses =
    "p-0 bg-transparent border-transparent focus:shadow-none focus:border-transparent";

  const handleOnFiatChange = ({ target: { value } }: { target: { value: string } }) => {
    setValue("fiatAmount", value);
    setValue("tokenAmount", tokenAmountFromFiatAmount(+value).toFixed(2));
  };

  const handleOnTokenChange = ({ target: { value } }: { target: { value: string } }) => {
    setValue("tokenAmount", value);
    setValue("fiatAmount", fiatAmountFromTokenAmount(+value).toFixed(2));
  };

  const handleOnSubmit = (values: FormValues) => {
    onSubmit(values);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleOnSubmit)}>
      <div className="flex justify-between px-2 py-1 mt-1 border-1 border-gray-300 rounded-lg hover:bg-gray-100">
        <div className="flex items-center justify-center">
          {icon}
          <span className="flex items-center text-sm pl-2">{ticker}</span>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex text-xl">
            <input
              required
              className={`${inputClasses} text-xl w-full text-right leading-none outline-none`}
              type="number"
              min={0}
              step={0.01}
              placeholder="0.00"
              {...register("fiatAmount")}
              onChange={handleOnFiatChange}
            />
            <span className="mt-px">$</span>
          </div>
          <div className="flex text-xs">
            <input
              required
              className={`${inputClasses} text-xs w-full text-right leading-none outline-none`}
              type="number"
              min={0}
              step={0.01}
              placeholder="0"
              {...register("tokenAmount")}
              onChange={handleOnTokenChange}
            />
            <span className="mt-px">{ticker}</span>
          </div>
        </div>
      </div>
      <div className="flex mt-4">
        {connected && (
          <Button block submit color="primary" size="lg" disabled={submitting}>
            {submitting && (
              <div className="mr-4">
                <Spinner size="sm" />
              </div>
            )}
            {awaitingApproval && "Awaiting Approval"}
            {!awaitingApproval && (type === "sell" ? "Sell" : "Buy")}
          </Button>
        )}
      </div>
    </form>
  );
};
