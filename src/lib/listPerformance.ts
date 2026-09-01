import { Platform } from 'react-native';

/**
 * Shared FlatList tuning.
 *
 * `removeClippedSubviews` meaningfully reduces Android's view count while
 * scrolling, but on iOS it has historically caused blank cells for little gain,
 * so it is enabled per platform here rather than at each call site.
 */
export const listPerformanceProps = {
  removeClippedSubviews: Platform.OS === 'android',
  initialNumToRender: 12,
  maxToRenderPerBatch: 10,
  updateCellsBatchingPeriod: 50,
  windowSize: 11,
} as const;
