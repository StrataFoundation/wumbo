import { ApolloClient, InMemoryCache } from "@apollo/client";
import { STRATA_API_URL } from "./globals";

export const wumboApi = new ApolloClient({
  uri: STRATA_API_URL,
  cache: new InMemoryCache({
    resultCaching: false,
  }),
});
