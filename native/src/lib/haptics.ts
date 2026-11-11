import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

async function fire(run: () => Promise<void>) {
  if (Platform.OS === "web") return;
  try {
    await run();
  } catch {
    /* Expo Go can refuse haptics on simulators. */
  }
}

export function hapticTap() {
  return fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function hapticSelect() {
  return fire(() => Haptics.selectionAsync());
}

export function hapticSuccess() {
  return fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function hapticError() {
  return fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
}
