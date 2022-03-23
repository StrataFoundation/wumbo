import { SITE_URL } from "@/constants";

const defaultSeo = {
  title: "Wum.bo",
  description:
    "Wumbo is a Browser Extension that sits on top of Twitter and lets you mint tokens for your favorite creators.",
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Wum.bo",
    description:
      "Wumbo is a Browser Extension that sits on top of Twitter and lets you mint tokens for your favorite creators.",
    images: [{ url: `${SITE_URL}/seo-splash.png.jpg` }],
    site_name: "Wumbo",
  },
  twitter: {
    handle: "@teamwumbo",
    site: SITE_URL,
    cardType: "summary_large_image",
  },
};

export default defaultSeo;
