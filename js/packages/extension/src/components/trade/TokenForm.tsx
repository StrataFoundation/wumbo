import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { Avatar, Button, Spinner } from "wumbo-common";
import { useWallet } from "wumbo-common";
import { routes } from "@/constants/routes";
import Logo from "../../../public/assets/img/logo.svg";

export type FormValues = {
  fiatAmount: number;
  tokenAmount: number;
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
  const location = useLocation();
  const { connected, awaitingApproval } = useWallet();
  const { register, handleSubmit, setValue, reset } = useForm<FormValues>();

  const inputClasses =
    "wum-p-0 wum-bg-transparent wum-border-transparent focus:wum-shadow-none focus:wum-border-transparent";

  const handleOnFiatChange = ({ target: { value } }: { target: { value: string } }) => {
    setValue("fiatAmount", Number(value));
    setValue("tokenAmount", +tokenAmountFromFiatAmount(+value).toFixed(2));
  };

  const handleOnTokenChange = ({ target: { value } }: { target: { value: string } }) => {
    setValue("tokenAmount", Number(value));
    setValue("fiatAmount", +fiatAmountFromTokenAmount(+value).toFixed(2));
  };

  const handleOnSubmit = (values: FormValues) => {
    onSubmit(values);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleOnSubmit)}>
      <div className="wum-flex wum-justify-between wum-px-2 wum-py-1 wum-mt-1 wum-border-1 wum-border-gray-300 wum-rounded-lg hover:wum-bg-gray-100">
        <div className="wum-flex wum-items-center wum-justify-center">
          {icon}
          <span className="wum-flex items-center text-sm pl-2">{ticker}</span>
        </div>
        <div className="wum-flex wum-flex-col wum-items-end">
          <div className="wum-flex wum-text-xl">
            <input
              required
              className={`${inputClasses} wum-text-xl wum-w-full wum-text-right wum-leading-none`}
              type="number"
              min={0}
              step={0.01}
              placeholder="0.00"
              {...register("fiatAmount")}
              onChange={handleOnFiatChange}
            />
            <span className="wum-mt-px">$</span>
          </div>
          <div className="wum-flex wum-text-xs">
            <input
              required
              className={`${inputClasses} wum-text-xs wum-w-full wum-text-right wum-leading-none`}
              type="number"
              min={0}
              step={0.01}
              placeholder="0"
              {...register("tokenAmount")}
              onChange={handleOnTokenChange}
            />
            <span className="wum-mt-px">{ticker}</span>
          </div>
        </div>
      </div>
      <div className="wum-flex wum-mt-4">
        {connected && (
          <Button block submit color="primary" size="lg" disabled={submitting}>
            {submitting && (
              <div className="wum-mr-4">
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
