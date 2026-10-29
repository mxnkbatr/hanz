import { createContext, useContext } from "react";

/** True while pages sit inside the phone's iOS-style route stack; PageShell then skips its own fade. */
export const RouteStackContext = createContext(false);
export const useInRouteStack = () => useContext(RouteStackContext);
