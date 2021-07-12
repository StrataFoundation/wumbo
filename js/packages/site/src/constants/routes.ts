type Route = {
  path: string;
};

interface IRoutes {
  betaSplash: Route;
}

const routes: IRoutes = {
  betaSplash: { path: "/" },
};

export default routes;
