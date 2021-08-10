import { classNames } from "../utils";
import React from "react";

export const LeaderboardNumber = React.memo(
  ({ children = null as any, selected = false }: { children: any; selected?: boolean }) => (
    <div
      className={classNames(
        "wum-w-10 wum-font-semibold wum-text-sm wum-text-center",
        selected ? "wum-text-gray-700" : "wum-text-gray-400"
      )}
    >
      {children}
    </div>
  )
);
