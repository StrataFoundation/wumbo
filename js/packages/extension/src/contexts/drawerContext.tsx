import React, { FC, ReactNode, createContext, useContext, useState, useCallback } from "react";

export interface IDrawerProviderProps {
  children: ReactNode;
}

export interface IDrawerContextState {
  isOpen: boolean;
  isCreating: boolean;
  creator: { name: string | undefined; img: string | undefined };

  toggleDrawer: ({
    isOpen,
    isCreating,
    creator,
  }?: {
    isOpen?: boolean;
    isCreating?: boolean;
    creator?: { name: string | undefined; img: string | undefined };
  }) => void;

  toggleCreating: ({ isCreating }?: { isCreating?: boolean }) => void;
}

const DrawerContext = createContext<IDrawerContextState>({} as IDrawerContextState);

const DrawerProvider: FC<IDrawerProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [creatorName, setCreatorName] = useState<string>();
  const [creatorImg, setCreatorImg] = useState<string>();

  const toggleDrawer = useCallback(
    async ({
      isOpen: isOpenOverride,
      isCreating: isCreatingOverride,
      creator,
    }: {
      isOpen?: boolean;
      isCreating?: boolean;
      creator?: { name: string | undefined; img: string | undefined };
    } = {}) => {
      setIsOpen(isOpenOverride || !isOpen);
      if (isCreating !== undefined) setIsCreating(isCreatingOverride as boolean);

      if (creator) {
        setCreatorName(creator.name);
        setCreatorImg(creator.img);
      }
    },
    [isOpen, setIsOpen]
  );

  const toggleCreating = useCallback(
    async ({ isCreating: isCreatingOverride }: { isCreating?: boolean } = {}) => {
      setIsCreating(isCreatingOverride || !isCreating);
    },
    [isCreating, setIsCreating]
  );

  return (
    <DrawerContext.Provider
      value={{
        isOpen,
        isCreating,
        creator: { name: creatorName, img: creatorImg },
        toggleDrawer,
        toggleCreating,
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
