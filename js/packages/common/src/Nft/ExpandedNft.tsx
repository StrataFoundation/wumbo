import React, { Fragment, Dispatch, SetStateAction } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ITokenWithMeta } from "../utils";
import { XIcon } from "@heroicons/react/solid";
import { Nft } from "./Nft";

export const ExpandedNft = ({
  isExpanded,
  setIsExpanded,
  tokenData,
}: {
  isExpanded: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
  tokenData: ITokenWithMeta;
}) => (
  <Transition.Root show={isExpanded} as={Fragment}>
    <Dialog
      as="div"
      className="fixed z-10 inset-0 overflow-y-auto"
      onClose={() => setIsExpanded(false)}
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <button
          className="absolute top-4 right-4 text-gray-200 hover:text-gray-400 focus:outline-none"
          onClick={() => setIsExpanded(false)}
        >
          <XIcon className="h-6 w-6" aria-hidden="true" />
        </button>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div className="inline-flex justify-center align-middle m-auto transform transition-all">
            {tokenData.data && <Nft data={tokenData.data} />}
          </div>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition.Root>
);
