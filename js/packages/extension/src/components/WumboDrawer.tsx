import React, { Fragment, ReactNode } from "react";
import { NavLink } from "react-router-dom";
import startCase from "lodash/startCase";
import { Toaster } from "react-hot-toast";
import { Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import { useDrawer } from "@/contexts/drawerContext";
import { routes, IRoutes } from "@/constants/routes";
import { useUserInfo } from "@/utils/userState";
import { Spinner, WUM_BONDING } from "wumbo-common";

export const WumboDrawer = (props: { children: ReactNode }) => {
  const { isOpen } = useDrawer();

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        <Transition.Root show={isOpen} as={Fragment}>
          <div className="fixed inset-0 overflow-hidden">
            {/* TODO: We can customize the 280px here based on where they drag the drawer */}
            <div
              style={{ top: "calc(50% - 280px)" }}
              className="fixed right-0 pl-10 max-w-full flex"
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
                <div className="w-screen max-w-340px pointer-events-auto shadow-2xl">
                  <div className="h-560px w-340px flex flex-col bg-white rounded-l-lg text-black">
                    {props.children}
                  </div>
                  <Toaster
                    containerClassName="!absolute !bottom-0 !top-auto !left-auto !right-auto !w-full !w-max-340px"
                    position="bottom-center"
                  />
                </div>
              </Transition.Child>
            </div>
          </div>
        </Transition.Root>
      </div>
    </div>
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
  const { toggleDrawer } = useDrawer();
  const hasTitle = !!(props as HeaderNoChildren).title;

  return (
    <div className="px-4 py-3 border-b-1 border-gray-200">
      <div className="flex items-start justify-between">
        <div className="w-full">
          {hasTitle && (
            <p className="text-lg font-medium text-indigo-600">
              {(props as HeaderNoChildren).title}
            </p>
          )}
          {!hasTitle && (props as HeaderWithChildren).children}
        </div>
        <div className="ml-3 h-7 flex items-center">
          <button
            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={() => toggleDrawer()}
          >
            <XIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

WumboDrawer.Content = (props: { children: ReactNode }) => (
  <div className="mt-4 overflow-y-auto relative flex-1 px-4">{props.children}</div>
);

WumboDrawer.Nav = () => {
  const { creator } = useDrawer();
  const creatorInfoState = useUserInfo(creator?.name!);
  const { userInfo: creatorInfo, loading } = creatorInfoState;

  return (
    <div className="flex flex-row justify-around pt-2 px-2 border-t-1 border-gray-200">
      {Object.keys(routes).map((route) => {
        const { path, Icon, isDrawerNav } = routes[route as keyof IRoutes];

        // Fill paths with params in
        let filledPath = path;
        if (path.endsWith(":tokenBondingKey")) {
          filledPath = `${path.replace(
            ":tokenBondingKey",
            creatorInfo?.tokenBonding?.publicKey?.toBase58() || WUM_BONDING.toBase58()
          )}${creatorInfo ? "?name=" + creatorInfo.name : ""}`;
        }

        if (isDrawerNav && Icon) {
          return (
            <NavLink
              to={filledPath}
              key={path}
              className="flex flex-col justify-center items-center border-transparent text-gray-500 text-xs font-medium inline-flex items-center px-2 py-2 border-b-3 text-xs font-medium hover:border-gray-300 hover:text-gray-700"
              activeClassName="!border-indigo-500 !text-indigo-500"
            >
              {/* @ts-ignore */}
              <Icon className="h-5 w-5" />
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
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" color="primary" />
      </div>
    </WumboDrawer.Content>
  </Fragment>
);
