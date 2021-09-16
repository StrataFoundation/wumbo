import React from "react";
import { AnchorPrograms, getPrograms } from "../constants/programs";
import { useProvider } from "../contexts";

export function usePrograms(): AnchorPrograms {
  const provider = useProvider();
  const programs = React.useMemo(() => provider ? getPrograms(provider) : {}, [provider]);

  return programs;
}
