import React, { FC, ReactNode, createContext, useContext, useState, useCallback } from "react";

export interface IDrawerProviderProps {
  children: ReactNode;
}

export interface IDrawerContextState {
  isOpen: boolean;
  creator: { name: string | undefined; img: string | undefined };

  toggleDrawer: ({
    isOpen,
    creator,
  }?: {
    isOpen?: boolean;
    creator?: { name: string | undefined; img: string | undefined };
  }) => void;
}

const DrawerContext = createContext<IDrawerContextState>({} as IDrawerContextState);

const DrawerProvider: FC<IDrawerProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [creatorName, setCreatorName] = useState<string>();
  const [creatorImg, setCreatorImg] = useState<string>();

  const toggleDrawer = useCallback(
    async ({
      isOpen: isOpenOverride,
      creator,
    }: {
      isOpen?: boolean;
      creator?: { name: string | undefined; img: string | undefined };
    } = {}) => {
      setIsOpen(isOpenOverride || !isOpen);

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
        toggleDrawer,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};

const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (context === undefined) {
    throw new Error("useCount must be used within a DrawerProvider");
  }
  return context;
};

export { DrawerProvider, useDrawer };
