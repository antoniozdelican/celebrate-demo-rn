import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { UserSummary } from '@/features/users/api/users.types';
import { USER_ROW_HEIGHT, UserListItem } from '@/features/users/components/UserListItem';
import { useUserSearch } from '@/features/users/hooks/useUserSearch';
import { useUsersList } from '@/features/users/hooks/useUsersList';
import { listPerformanceProps } from '@/lib/listPerformance';
import { testIDs } from '@/lib/testIDs';
import type { RootStackParamList } from '@/navigation/types';
import { colors, spacing } from '@/theme/tokens';
import { Screen } from '@/ui/Screen';
import { EmptyState } from '@/ui/states/EmptyState';
import { ErrorState } from '@/ui/states/ErrorState';
import { LoadingState } from '@/ui/states/LoadingState';

type Props = NativeStackScreenProps<RootStackParamList, 'UsersList'>;

export function UsersListScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { setQuery, debouncedQuery, clear } = useUserSearch();

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

  // UISearchController on iOS, androidx SearchView on Android — native clear,
  // Cancel/back handling and a11y traits for free, at the cost of a testID.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: 'Search users',
        autoCapitalize: 'none',
        onChangeText: (event) => setQuery(event.nativeEvent.text),
        // iOS Cancel and Android's back-collapse both clear.
        onCancelButtonPress: clear,
        onClose: clear,
        // .navigationBarDrawer(displayMode: .always) — no large title to hide under.
        hideWhenScrolling: false,
        tintColor: colors.primary,
        textColor: colors.textPrimary,
        hintTextColor: colors.textSecondary,
        headerIconColor: colors.textSecondary,
      },
    });
  }, [navigation, setQuery, clear]);

  // Own flag: `isRefetching` is also true during pagination.
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Stable so memoised rows survive every keystroke.
  const handlePressUser = useCallback(
    (userId: number) => navigation.navigate('UserDetail', { userId }),
    [navigation],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback<ListRenderItem<UserSummary>>(
    ({ item }) => <UserListItem user={item} onPress={handlePressUser} />,
    [handlePressUser],
  );

  const keyExtractor = useCallback((user: UserSummary) => String(user.id), []);

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

  if (showFullScreenLoading) {
    return (
      <Screen testID={testIDs.usersList.screen} edges={[]}>
        <LoadingState testID={testIDs.usersList.loading} />
      </Screen>
    );
  }

  if (showFullScreenError) {
    return (
      <Screen testID={testIDs.usersList.screen} edges={[]}>
        <ErrorState
          testID={testIDs.usersList.error}
          retryTestID={testIDs.usersList.errorRetry}
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => void refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen testID={testIDs.usersList.screen} edges={[]}>
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
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={
          users.length === 0 ? styles.emptyContent : { paddingBottom: insets.bottom }
        }
        scrollIndicatorInsets={{ bottom: insets.bottom }}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyContent: { flexGrow: 1 },
  footer: { paddingVertical: spacing.lg },
});
