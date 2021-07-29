import React, { Fragment } from "react";
import { AppendChildPortal } from "wumbo-common";
import { useUserCells } from "../../utils/twitterSpotter";
import { MainButton } from "../MainButton";

export const UserCellEnhancer = () => {
  const cells = useUserCells();
  const btnCache = new Map<string, JSX.Element>();

  const getOrElseUpdate = (name: string, updateFn: () => JSX.Element) => {
    if (btnCache.has(name)) return btnCache.get(name)!;

    const newVal = updateFn();
    btnCache.set(name, newVal);
    return newVal;
  };

  if (cells) {
    const cellEls = cells
      .map((cell) => {
        const buttonEl = cell.buttonTarget
          ? getOrElseUpdate(cell.name, () => (
              <MainButton
                creatorName={cell.name}
                creatorImg={cell.avatar || ""}
                btnProps={{
                  className: "!py-1",
                  size: "md",
                  rounded: true,
                }}
              />
            ))
          : null;

        if (buttonEl) {
          cell!.buttonTarget!.style!.cssText =
            "display:flex;flex-direction:row;align-items:center;";

          return (
            <Fragment key={cell.name}>
              <AppendChildPortal container={cell.buttonTarget as Element}>
                <div className="flex justify-center self-start ml-2">
                  {buttonEl}
                </div>
              </AppendChildPortal>
            </Fragment>
          );
        }

        return null;
      })
      .filter(Boolean);

    return <Fragment>{cellEls}</Fragment>;
  }

  return null;
};
