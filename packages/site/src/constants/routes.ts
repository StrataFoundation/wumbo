type Route = {
  path: string;
};

interface ISiteRoutes {
  root: Route;
  tutorial: Route;
}

export const SiteRoutes: ISiteRoutes = {
  root: { path: "/" },
  tutorial: { path: "/tutorial" },
};
