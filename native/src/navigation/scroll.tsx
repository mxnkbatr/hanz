import { createContext, useContext } from "react";
import type { SharedValue } from "react-native-reanimated";

const ScrollYContext = createContext<SharedValue<number> | null>(null);

export const ScrollYProvider = ScrollYContext.Provider;

export function useScrollY() {
  return useContext(ScrollYContext);
}
