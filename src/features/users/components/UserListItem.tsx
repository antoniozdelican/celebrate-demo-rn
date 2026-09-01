import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { StyleSheet } from 'react-native';

import type { UserSummary } from '@/features/users/api/users.types';
import { testIDs } from '@/lib/testIDs';
import { colors } from '@/theme/tokens';
import { Avatar } from '@/ui/Avatar';
import { ListItem } from '@/ui/ListItem';

/** Fixed so the list can use getItemLayout instead of measuring. */
export const USER_ROW_HEIGHT = 76;

export type UserListItemProps = {
  user: UserSummary;
  onPress: (id: number) => void;
};

function UserListItemComponent({ user, onPress }: UserListItemProps) {
  return (
    <ListItem
      testID={testIDs.usersList.row(user.id)}
      title={user.fullName}
      subtitle={user.headline}
      left={<Avatar uri={user.avatarUrl} name={user.fullName} size="md" />}
      right={<Ionicons name="chevron-forward" size={18} color={colors.chevron} />}
      onPress={() => onPress(user.id)}
      style={styles.row}
    />
  );
}

/** Memoised: otherwise every row re-renders on each page append. */
export const UserListItem = memo(UserListItemComponent);

const styles = StyleSheet.create({
  row: {
    height: USER_ROW_HEIGHT,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
