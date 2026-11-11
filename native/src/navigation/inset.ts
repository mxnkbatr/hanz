import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Space kept clear of the floating glass tab bar. */
export function useTabClearance() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, 12) + 86;
}
