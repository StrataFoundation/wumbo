import { useAsync } from "react-async-hook";
import { useErrorHandler } from "@strata-foundation/react";
import { AnchorPrograms, getPrograms } from "../constants/programs";
import { useProvider } from "../contexts";

export function usePrograms(): AnchorPrograms {
  const provider = useProvider();
  const { handleErrors } = useErrorHandler();
  const { result: programs, error } = useAsync(
    () => getPrograms(provider),
    [provider]
  );
  handleErrors(error);

  return programs || {};
}
