import * as React from "react";

type Action =
  | { type: "toggle"; data?: { creatorName: string; creatorImg: string } }
  | { type: "setBtnPos"; data: [number, number] };
type Dispatch = (action: Action) => void;
type State = {
  btnPos: [number, number];
  isOpen: boolean;
  lastLocation: string | null;
  creator: { name: string | null; img: string | null };
};
type DrawerProviderProps = { children: React.ReactNode };

const defaultState: State = {
  btnPos: [0, 0],
  isOpen: false,
  lastLocation: null,
  creator: { name: null, img: null },
};

const DrawerStateContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

const drawerReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "toggle": {
      return {
        ...state,
        isOpen: !state.isOpen,
        creator: {
          name: action.data?.creatorName || state.creator.name || null,
          img: action.data?.creatorImg || state.creator.img || null,
        },
      };
    }
    case "setBtnPos": {
      return { ...state, btnPos: action.data };
    }
    default: {
      throw new Error(`Unhandled action type: ${action!.type}`);
    }
  }
};

const DrawerProvider = ({ children }: DrawerProviderProps) => {
  const [state, dispatch] = React.useReducer(drawerReducer, defaultState);
  const value = { state, dispatch };

  return (
    <DrawerStateContext.Provider value={value}>
      {children}
    </DrawerStateContext.Provider>
  );
};

const useDrawer = () => {
  const context = React.useContext(DrawerStateContext);
  if (context === undefined) {
    throw new Error("useCount must be used within a DrawerProvider");
  }
  return context;
};

export { DrawerProvider, useDrawer };
