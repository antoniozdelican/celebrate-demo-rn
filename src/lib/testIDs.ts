/**
 * Test IDs shared by the app and the Detox suite.
 *
 * Detox selectors are strings with no compile-time link to the components they
 * target, so a rename normally breaks E2E silently. Routing both sides through
 * this module turns that into a type error instead.
 */
export const testIDs = {
  usersList: {
    screen: 'users-list-screen',
    list: 'users-list',
    // NB: the search field is the platform's native control and has no
    // testID — react-native-screens' SearchBarProps does not expose one.
    // E2E matches it by native type instead; see e2e/users.e2e.ts.
    loading: 'users-list-loading',
    error: 'users-list-error',
    errorRetry: 'users-list-error-retry',
    empty: 'users-list-empty',
    footerLoading: 'users-list-footer-loading',
    /** Row id is stable across list and search results. */
    row: (id: number) => `user-row-${id}`,
  },
  userDetail: {
    screen: 'user-detail-screen',
    scroll: 'user-detail-scroll',
    header: 'user-detail-header',
    /** Cross-fades in as the collapsible header shrinks. */
    compactTitle: 'user-detail-compact-title',
    loading: 'user-detail-loading',
    error: 'user-detail-error',
    errorRetry: 'user-detail-error-retry',
  },
} as const;
