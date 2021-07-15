type Route = {
  path: string;
};

interface IRoutes {
  betaSplash: Route;
  claim: Route;
  profile: Route;
  wallet: Route;
}

const routes: IRoutes = {
  claim: { path: "/claim" },
  wallet: { path: "/wallet" },
  profile: { path: "/profile/:key" },
  betaSplash: { path: "/" }
};

export default routes;
