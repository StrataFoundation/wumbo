import React, { Fragment } from "react";
import { AppendChildPortal } from "wumbo-common";
import { useUserCells } from "../../utils/twitterSpotter";
import { MainButton } from "../MainButton";

export const UserCellEnhancer = () => {
  const cells = useUserCells();

  if (cells) {
    const cellEls = cells
      .map((cell) => {
        const buttonEl = cell.buttonTarget ? (
          <MainButton
            creatorName={cell.name}
            creatorImg={cell.avatar || ""}
            btnProps={{
              className: "!px-4 !py-1.5",
              size: "md",
              rounded: true,
            }}
          />
        ) : null;

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
