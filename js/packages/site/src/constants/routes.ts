type Route = {
  path: string;
};

interface IRoutes {
  betaSplash: Route;
  claim: Route;
}

const routes: IRoutes = {
  betaSplash: { path: "/" },
  claim: { path: "/claim" }
};

export default routes;
