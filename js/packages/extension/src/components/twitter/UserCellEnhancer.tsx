import React, { Fragment } from "react";
import ReactShadow from "react-shadow/emotion";
import { ThemeProvider, theme, Box, CSSReset } from "@chakra-ui/react";
import { AppendChildPortal } from "wumbo-common";
import { useUserCells } from "../../utils/twitterSpotter";
import { MainButton } from "../MainButton";

let incrementingId = 0;
function getElementId(element: HTMLElement | null): string {
  if (!element) {
    return "";
  }

  if (!element.id) {
    incrementingId++;
    element.id = "user_cell_id_" + incrementingId;
  }

  return element.id;
}

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
              size: "md",
              paddingY: "2px",
              borderRadius: "full",
            }}
          />
        ) : null;

        if (buttonEl) {
          cell!.buttonTarget!.style!.cssText =
            "display:flex;flex-direction:row;align-items:center;";

          return (
            <Fragment key={cell.name + getElementId(cell.buttonTarget)}>
              <AppendChildPortal container={cell.buttonTarget as Element}>
                <ReactShadow.div>
                  <ThemeProvider theme={theme}>
                    <CSSReset />
                    <Box
                      d="flex"
                      justifyContent="center"
                      justifySelf="start"
                      marginLeft="4px"
                    >
                      {buttonEl}
                    </Box>
                  </ThemeProvider>
                </ReactShadow.div>
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
