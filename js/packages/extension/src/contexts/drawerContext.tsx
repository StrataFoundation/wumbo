import React, { FC, ReactNode, createContext, useContext, useState, useCallback } from "react";

export interface IDrawerProviderProps {
  children: ReactNode;
}

export interface IDrawerContextState {
  isOpen: boolean;
  creator: { name: string | undefined; img: string | undefined };

  toggle: ({
    toggleOverride,
    creator,
  }?: {
    toggleOverride?: boolean;
    creator?: { name: string | undefined; img: string | undefined };
  }) => void;
}

const DrawerContext = createContext<IDrawerContextState>({} as IDrawerContextState);

const DrawerProvider: FC<IDrawerProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [creatorName, setCreatorName] = useState<string>();
  const [creatorImg, setCreatorImg] = useState<string>();

  const toggle = useCallback(
    async ({
      toggleOverride,
      creator,
    }: {
      toggleOverride?: boolean;
      creator?: { name: string | undefined; img: string | undefined };
    } = {}) => {
      setIsOpen(toggleOverride || !isOpen);

      if (creator) {
        setCreatorName(creator.name);
        setCreatorImg(creator.img);
      }
    },
    [isOpen, setIsOpen]
  );

  return (
    <DrawerContext.Provider
      value={{
        isOpen,
        creator: { name: creatorName, img: creatorImg },
        toggle,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};

const useDrawer = () => {
  const context = React.useContext(DrawerContext);
  if (context === undefined) {
    throw new Error("useCount must be used within a DrawerProvider");
  }
  return context;
};

export { DrawerProvider, useDrawer };
