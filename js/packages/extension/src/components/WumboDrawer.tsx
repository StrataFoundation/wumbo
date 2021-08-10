import React, { Fragment, ReactNode } from "react";
import { NavLink } from "react-router-dom";
import startCase from "lodash/startCase";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import { useDrawer } from "@/contexts/drawerContext";
import { routes, IRoutes } from "@/constants/routes";
import { useUserInfo } from "@/utils/userState";
import { Spinner } from "wumbo-common";

export const WumboDrawer = (props: { children: ReactNode }) => {
  const { isOpen, toggle } = useDrawer();

  chrome.runtime.onMessage.addListener((request, _, __) => {
    if (request.type === "TOGGLE_WUMBO") {
      isOpen ? toggle({ toggleOverride: false }) : toggle({ toggleOverride: true });
    }
  });

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        static
        className="wum-fixed wum-inset-0 wum-overflow-hidden wum-z-infinity"
        open={isOpen}
        onClose={() => toggle({ toggleOverride: false })}
      >
        <div className="wum-absolute wum-inset-0 wum-overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="wum-absolute wum-inset-0 wum-bg-gray-800 wum-bg-opacity-75 wum-transition-opacity" />
          </Transition.Child>

          {/* TODO: We can customize the 280px here based on where they drag the drawer */}
          <div
            style={{ top: "calc(50% - 280px)" }}
            className="wum-fixed wum-right-0 wum-pl-10 wum-max-w-full wum-flex"
          >
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300 sm:duration-500"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300 sm:duration-500"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="wum-w-screen wum-max-w-340px">
                <div className="wum-h-560px wum-w-340px wum-flex wum-flex-col wum-bg-white wum-rounded-l-lg wum-shadow-xl">
                  {props.children}
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

interface HeaderNoChildren {
  title?: string;
}

interface HeaderWithChildren {
  children: ReactNode;
}

type HeaderProps = HeaderNoChildren | HeaderWithChildren;

WumboDrawer.Header = (props: HeaderProps) => {
  const { toggle } = useDrawer();
  const hasTitle = !!(props as HeaderNoChildren).title;

  return (
    <div className="wum-px-4 wum-py-3 wum-border-b-1 wum-border-gray-200">
      <div className="wum-flex wum-items-start wum-justify-between">
        <div className="wum-w-full">
          {hasTitle && (
            <p className="wum-text-lg wum-font-medium wum-text-indigo-600">
              {(props as HeaderNoChildren).title}
            </p>
          )}
          {!hasTitle && (props as HeaderWithChildren).children}
        </div>
        <div className="wum-ml-3 wum-h-7 wum-flex wum-items-center">
          <button
            className="wum-bg-white wum-rounded-md wum-text-gray-400 hover:wum-text-gray-500 focus:wum-outline-none"
            onClick={() => toggle({ toggleOverride: false })}
          >
            <span className="wum-sr-only">Close panel</span>
            <XIcon className="wum-h-6 wum-w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

WumboDrawer.Content = (props: { children: ReactNode }) => (
  <div className="wum-mt-4 wum-overflow-y-auto wum-relative wum-flex-1 wum-px-4">
    {props.children}
  </div>
);

WumboDrawer.Nav = () => {
  const { creator } = useDrawer();
  const creatorInfoState = useUserInfo(creator?.name!);
  const { userInfo: creatorInfo, loading } = creatorInfoState;

  return (
    <div className="wum-flex wum-flex-row wum-justify-around wum-pt-2 wum-px-2 wum-border-t-1 wum-border-gray-200">
      {Object.keys(routes).map((route) => {
        const { path, Icon, isDrawerNav } = routes[route as keyof IRoutes];

        // Fill paths with params in
        let filledPath = path;
        if (path.endsWith(":tokenBondingKey") && creatorInfo) {
          filledPath =
            path.replace(":tokenBondingKey", creatorInfo.tokenBonding.publicKey.toBase58()) +
            `?name=${creatorInfo.name}`;
        }

        if (isDrawerNav && Icon) {
          return (
            <NavLink
              to={filledPath}
              key={path}
              className="wum-flex wum-flex-col wum-justify-center wum-items-center wum-border-transparent wum-text-gray-500 wum-text-xs wum-font-medium wum-inline-flex wum-items-center wum-px-2 wum-py-2 wum-border-b-3 wum-text-xs wum-font-medium hover:wum-border-gray-300 hover:wum-text-gray-700"
              activeClassName="!wum-border-indigo-500 !wum-text-indigo-500"
            >
              {/* @ts-ignore */}
              <Icon className="wum-h-5 wum-w-5" />
              <span>{startCase(route)}</span>
            </NavLink>
          );
        } else {
          return null;
        }
      })}
    </div>
  );
};

WumboDrawer.Loading = () => (
  <Fragment>
    <WumboDrawer.Header />
    <WumboDrawer.Content>
      <div className="wum-flex wum-justify-center wum-items-center wum-h-full">
        <Spinner size="lg" color="primary" />
      </div>
    </WumboDrawer.Content>
  </Fragment>
);
