/** Shared with the Detox suite so a rename is a type error, not a silent break. */
export const testIDs = {
  usersList: {
    screen: 'users-list-screen',
    list: 'users-list',
    // The search field is native and has no testID; E2E matches it by type.
    loading: 'users-list-loading',
    error: 'users-list-error',
    errorRetry: 'users-list-error-retry',
    empty: 'users-list-empty',
    footerLoading: 'users-list-footer-loading',
    row: (id: number) => `user-row-${id}`,
  },
  userDetail: {
    screen: 'user-detail-screen',
    scroll: 'user-detail-scroll',
    header: 'user-detail-header',
    compactTitle: 'user-detail-compact-title',
    loading: 'user-detail-loading',
    error: 'user-detail-error',
    errorRetry: 'user-detail-error-retry',
  },
} as const;
