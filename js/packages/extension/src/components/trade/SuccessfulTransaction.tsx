import React, { ReactNode, useEffect } from "react";
import { Transition } from "@headlessui/react";
import { Avatar } from "wumbo-common";

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
      <div className="wum-flex wum-flex-col wum-justify-center wum-items-center wum-absolute wum-inset-0 wum-w-full wum-h-full wum-bg-white">
        {tokenSvg
          ? tokenSvg
          : tokenSrc || (tokenName && <Avatar token name={tokenName} imgSrc={tokenSrc} />)}
        <div className="wum-flex wum-flex-col wum-jusfity-center wum-text-center wum-px-8 wum-mt-4">
          <span>
            You're transaction is complete. You now own {amount?.toFixed(4)} of {tokenName}! View
            your wallet to view further details.
          </span>
          <span
            className="wum-cursor-pointer wum-text-indigo-600 hover:text-indigo-800 wum-mt-4 wum-text-sm"
            onClick={toggleShowing}
          >
            Dismiss
          </span>
        </div>
      </div>
    </Transition>
  );
};
