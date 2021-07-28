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
