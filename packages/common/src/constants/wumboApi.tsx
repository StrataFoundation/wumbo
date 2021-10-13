import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql,
} from "@apollo/client";
import { WUMBO_API_URL } from "./globals";

export const wumboApi = new ApolloClient({
  uri: WUMBO_API_URL,
  cache: new InMemoryCache({
    resultCaching: false,
  }),
});
