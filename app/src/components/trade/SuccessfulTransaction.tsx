import React, { ReactNode, useEffect } from "react";
import { Transition } from "@headlessui/react";
import { Avatar } from "@/components/common";

interface SuccessfulTransactionProps {
  amount: number | undefined;
  isShowing: boolean;
  toggleShowing: () => void;
  tokenSrc?: string;
  tokenName?: string;
  tokenSvg?: ReactNode;
}

export const SuccessfulTransaction = ({
  amount,
  isShowing,
  toggleShowing,
  tokenSrc,
  tokenName,
  tokenSvg,
}: SuccessfulTransactionProps) => {
  useEffect(() => {
    if (isShowing) {
      setTimeout(toggleShowing, 6000);
    }
  }, [isShowing, toggleShowing]);

  return (
    <Transition
      show={isShowing}
      enter="transition-opacity duration-75"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="flex flex-col justify-center items-center absolute inset-0 w-full h-full bg-white">
        {tokenSvg
          ? tokenSvg
          : tokenSrc ||
            (tokenName && <Avatar token name={tokenName} imgSrc={tokenSrc} />)}
        <div className="flex flex-col jusfity-center text-center px-8 mt-4">
          <span>
            You're transaction is complete. You now own {amount} of {tokenName}{" "}
            coin! View your wallet to view further details.
          </span>
          <span
            className="cursor-pointer text-indigo-600 hover:text-indigo-800 mt-4 text-sm"
            onClick={toggleShowing}
          >
            Dismiss
          </span>
        </div>
      </div>
    </Transition>
  );
};
