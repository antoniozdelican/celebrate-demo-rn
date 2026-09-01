import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';

import type { RootStackParamList } from '@/app/navigation/types';
import type { UserSummary } from '@/features/users/api/users.types';
import {
  USER_ROW_HEIGHT,
  UserListItem,
} from '@/features/users/components/UserListItem';
import { UserSearchBar } from '@/features/users/components/UserSearchBar';
import { useUsersList } from '@/features/users/hooks/useUsersList';
import { listPerformanceProps } from '@/lib/listPerformance';
import { testIDs } from '@/lib/testIDs';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { colors, spacing } from '@/theme/tokens';
import { EmptyState } from '@/ui/states/EmptyState';
import { ErrorState } from '@/ui/states/ErrorState';
import { LoadingState } from '@/ui/states/LoadingState';
import { Screen } from '@/ui/Screen';

/**
 * Long enough to collapse a burst of typing into one request, short enough to
 * still feel immediate. Tuned against the 350ms rule of thumb for search-as-
 * you-type.
 */
const SEARCH_DEBOUNCE_MS = 350;

type Props = NativeStackScreenProps<RootStackParamList, 'UsersList'>;

export function UsersListScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const {
    users,
    isSearching,
    isPending,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUsersList(debouncedQuery);

  // Pull-to-refresh tracks its own flag rather than reusing `isRefetching`,
  // which is also true while a next page is loading and would otherwise show
  // the pull spinner during pagination.
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Stable across renders so memoised rows are not invalidated every keystroke.
  const handlePressUser = useCallback(
    (userId: number) => navigation.navigate('UserDetail', { userId }),
    [navigation],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleClear = useCallback(() => setQuery(''), []);

  const renderItem = useCallback<ListRenderItem<UserSummary>>(
    ({ item }) => <UserListItem user={item} onPress={handlePressUser} />,
    [handlePressUser],
  );

  const keyExtractor = useCallback((user: UserSummary) => String(user.id), []);

  // Rows are a fixed height, so offsets can be computed instead of measured.
  const getItemLayout = useCallback(
    (_: ArrayLike<UserSummary> | null | undefined, index: number) => ({
      length: USER_ROW_HEIGHT,
      offset: USER_ROW_HEIGHT * index,
      index,
    }),
    [],
  );

  const showFullScreenError = isError && users.length === 0;
  const showFullScreenLoading = isPending && users.length === 0;

  return (
    <Screen testID={testIDs.usersList.screen} edges={['bottom']}>
      <UserSearchBar value={query} onChangeText={setQuery} onClear={handleClear} />

      {showFullScreenLoading ? (
        <LoadingState testID={testIDs.usersList.loading} />
      ) : showFullScreenError ? (
        <ErrorState
          testID={testIDs.usersList.error}
          retryTestID={testIDs.usersList.errorRetry}
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => void refetch()}
        />
      ) : (
        <FlatList
          testID={testIDs.usersList.list}
          data={users}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          // Lets a row tap register while the search keyboard is still open.
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={users.length === 0 ? styles.emptyContent : undefined}
          ListEmptyComponent={
            <EmptyState
              testID={testIDs.usersList.empty}
              title={isSearching ? 'No matches' : 'No users'}
              message={
                isSearching
                  ? `No users match “${debouncedQuery.trim()}”. Try a different name.`
                  : 'There are no users to show right now.'
              }
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View testID={testIDs.usersList.footerLoading} style={styles.footer}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
          {...listPerformanceProps}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyContent: { flexGrow: 1 },
  footer: { paddingVertical: spacing.lg },
});
