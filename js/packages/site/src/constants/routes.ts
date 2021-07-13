type Route = {
  path: string;
};

interface IRoutes {
  betaSplash: Route;
  claim: Route;
}

const routes: IRoutes = {
  claim: { path: "/claim" },
  betaSplash: { path: "/" }
};

export default routes;
