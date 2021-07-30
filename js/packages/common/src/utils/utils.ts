import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export function classNames(...classes: (false | null | undefined | string)[]) {
  return classes.filter(Boolean).join(" ");
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

export function useInterval(
  callback: (...args: any[]) => void,
  delay: number | null
) {
  const savedCallbackRef = useRef<(...args: any[]) => void>();

  useEffect(() => {
    savedCallbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (...args: any[]) => savedCallbackRef.current!(...args);

    if (delay !== null) {
      const intervalId = setInterval(handler, delay);
      return () => clearInterval(intervalId);
    }
  }, [delay]);
}
