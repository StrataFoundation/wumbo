import React, { useEffect, useState, useContext } from "react";
import { useHistory } from "react-router-dom";

export const HistoryContext = React.createContext<string[]>([]);

export const HistoryContextProvider: React.FC = ({ children }) => {
  const [myHistory, setHistory] = useState<string[]>([]);

  const history = useHistory();
  useEffect(() => {
    return history.listen((location, action) => {
      console.log(`${action}: ${location.pathname + location.search}`);
      if (action == "PUSH") {
        setHistory((existing: string[]) => [
          ...existing,
          location.pathname + location.search,
        ]);
      } else if (action == "POP") {
        setHistory((existing: string[]) => existing.slice(0, -1));
      } else if (action == "REPLACE") {
        setHistory((existing: string[]) => [
          ...existing.slice(0, -1),
          location.pathname + location.search,
        ]);
      }
    });
  }, [history]);

  return (
    <HistoryContext.Provider value={myHistory}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistoryList = (): string[] => {
  return useContext(HistoryContext);
};
