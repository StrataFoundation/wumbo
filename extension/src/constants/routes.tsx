import { ReactNode } from "react";
import {
  SwitchVerticalIcon,
  SearchIcon,
  DatabaseIcon,
  CashIcon,
  UserIcon,
} from "@heroicons/react/outline";

type Route = {
  path: string;
  Icon: ReactNode | null;
  isDrawerNav: boolean;
};

export interface IRoutes {
  create: Route;
  customize: Route;
  trade: Route;
  tradeWUM: Route;
  myCoins: Route;
  wallet: Route;
  search: Route;
  profile: Route;
}

export const routes: IRoutes = {
  create: { path: "/create", Icon: null, isDrawerNav: false },
  customize: { path: "/customize", Icon: null, isDrawerNav: false },
  trade: { path: "/trade", Icon: SwitchVerticalIcon, isDrawerNav: true },
  tradeWUM: { path: "/tradeWUM", Icon: null, isDrawerNav: false },
  myCoins: { path: "/mycoins", Icon: DatabaseIcon, isDrawerNav: true },
  wallet: { path: "/wallet", Icon: CashIcon, isDrawerNav: true },
  search: { path: "/search", Icon: SearchIcon, isDrawerNav: true },
  profile: { path: "/profile", Icon: UserIcon, isDrawerNav: true },
};

export const paths: string[] = Object.keys(routes).map(
  (route) => routes[route as keyof IRoutes].path
);
