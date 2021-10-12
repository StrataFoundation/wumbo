import React, { useEffect } from "react";
import { truthy } from "../utils";

interface IErrorHandlingContext {
  onError(error: Error): void
}
export const ErrorHandlingContext = React.createContext<IErrorHandlingContext>({
  onError: (error) => console.error(error)
});

export function useErrorHandler(): (error: Error) => void {
  const { onError } = React.useContext(ErrorHandlingContext);

  return onError
}

export function handleErrors(...errors: (Error | undefined)[]) {
  const onError = useErrorHandler();

  useEffect(() => {
    errors.filter(truthy).map(onError);
  }, errors)
}
