import React from "react";
import { useAsync } from "react-async-hook";
import { AnchorPrograms, getPrograms } from "../constants/programs";
import { handleErrors, useProvider } from "../contexts";

export function usePrograms(): AnchorPrograms {
  const provider = useProvider();
  const { result: programs, error } = useAsync(
    () => getPrograms(provider),
    [provider]
  );
  handleErrors(error);

  return programs || {};
}
