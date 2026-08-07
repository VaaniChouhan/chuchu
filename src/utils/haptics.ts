import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export function hapticLight() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

export function hapticMedium() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }
}

export function hapticWarning() {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }
}

export function hapticSuccess() {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }
}
