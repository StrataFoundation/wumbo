import { PublicKey } from "@solana/web3.js";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export function classNames(...classes: (false | null | undefined | string)[]) {
  return classes.filter(Boolean).join(" ");
}

export const truncatePubkey = (pkey: PublicKey): string => {
  const pkeyStr = pkey.toString();

  return `${pkeyStr.substr(0, 4)}...${pkeyStr.substr(pkeyStr.length - 4)}`;
};

export function useIsExtension(): boolean {
  // @ts-ignore
  return !!window.isExtension;
}

export function usePrevious<T extends unknown>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function useQuery(): URLSearchParams {
  const search = useLocation().search;
  const [query, setQuery] = useState<URLSearchParams>(
    new URLSearchParams(search)
  );

  useEffect(() => {
    setQuery(new URLSearchParams(search));
  }, [search]);
  return query;
}

export const replaceAll = (str: string, mapObj: Record<string, string>) => {
  const re = new RegExp(Object.keys(mapObj).join("|"), "gi");

  return str.replace(re, (matched: string) => mapObj[matched]);
};
