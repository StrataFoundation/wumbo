import { useCallback, useEffect, useRef, useState } from "react";
import { Keypair, Connection, PublicKey } from "@solana/web3.js";

export function classNames(...classes: (false | null | undefined | string)[]) {
  return classes.filter(Boolean).join(" ");
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useLocalStorageState<T>(
  key: string,
  defaultState: T
): [T, (arg0: T) => void] {
  const [state, setState] = useState(() => {
    let storedState = localStorage.getItem(key);
    if (storedState) {
      return JSON.parse(storedState);
    }
    return defaultState;
  });

  const setLocalStorageState = useCallback(
    (newState) => {
      let changed = state !== newState;
      if (!changed) {
        return;
      }
      setState(newState);
      if (newState === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newState));
      }
    },
    [state, key]
  );

  return [state, setLocalStorageState];
}

export function useEffectAfterTimeout(effect: () => void, timeout: number) {
  useEffect(() => {
    let handle = setTimeout(effect, timeout);
    return () => clearTimeout(handle);
  });
}

export function usePrevious<T extends unknown>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
