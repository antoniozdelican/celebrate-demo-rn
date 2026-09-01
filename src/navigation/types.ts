/** Only ids cross the boundary, so routes stay serialisable and deep-linkable. */
export type RootStackParamList = {
  UsersList: undefined;
  UserDetail: { userId: number; userName?: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
