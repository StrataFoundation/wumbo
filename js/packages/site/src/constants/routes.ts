type Route = {
  path: string;
};

interface IRoutes {
  betaSplash: Route;
  claim: Route;
  wallet: Route;
}

const routes: IRoutes = {
  claim: { path: "/claim" },
  wallet: { path: "/wallet" },
  betaSplash: { path: "/" }
};

export default routes;
