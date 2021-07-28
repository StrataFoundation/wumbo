type Route = {
  path: string;
};

interface IRoutes {
  betaSplash: Route;
  claim: Route;
  profile: Route;
  editProfile: Route;
  wallet: Route;
}

const routes: IRoutes = {
  claim: { path: "/claim" },
  wallet: { path: "/wallet" },
  profile: { path: "/profile/:ownerWalletKey" },
  editProfile: { path: "/profile/edit/:ownerWalletKey" },
  betaSplash: { path: "/" },
};

export default routes;
