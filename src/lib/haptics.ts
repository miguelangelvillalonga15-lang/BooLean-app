import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Vibraciones cortas. Si el celular no las soporta, no pasa nada.

function seguro(fn: () => Promise<void>) {
  if (Platform.OS === 'web') return;
  fn().catch(() => {});
}

export const vibrar = {
  acierto: () => seguro(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  error: () => seguro(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  toque: () => seguro(() => Haptics.selectionAsync()),
};
