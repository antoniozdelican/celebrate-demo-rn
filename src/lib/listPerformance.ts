import { Platform } from 'react-native';

export const listPerformanceProps = {
  // Android-only: on iOS this has historically caused blank cells.
  removeClippedSubviews: Platform.OS === 'android',
  initialNumToRender: 12,
  maxToRenderPerBatch: 10,
  updateCellsBatchingPeriod: 50,
  windowSize: 11,
} as const;
