/**
 * Route params.
 *
 * Only the user id is carried across the boundary — never the whole object.
 * The detail screen refetches by id, which keeps routes serialisable (so they
 * survive deep links and state restoration) and guarantees the detail view is
 * never rendered from a stale list summary.
 */
export type RootStackParamList = {
  UsersList: undefined;
  UserDetail: { userId: number; userName?: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
