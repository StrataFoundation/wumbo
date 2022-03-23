import { FC, useEffect } from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { DefaultSeo } from "next-seo";
import "../utils/bufferFill";
import { Providers, Header, Footer } from "@/components";
import SEO from "../next-seo.config";
import * as gtag from "@/utils/gtag";
import { IS_PRODUCTION } from "@/constants";

// Use require instead of import since order matters
require("../styles/globals.css");
require("@solana/wallet-adapter-react-ui/styles.css");

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: URL) => {
      /* invoke analytics function only for production */
      if (IS_PRODUCTION) {
      }
      gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <Providers>
      <DefaultSeo {...SEO} />
      <Component {...pageProps} />
      <Footer />
    </Providers>
  );
};

export default App;
