import { memo } from 'react';
import { StyleSheet } from 'react-native';

import type { UserSummary } from '@/features/users/api/users.types';
import { testIDs } from '@/lib/testIDs';
import { colors } from '@/theme/tokens';
import { Avatar } from '@/ui/Avatar';
import { ListItem } from '@/ui/ListItem';

/**
 * Fixed row height, so the list can supply `getItemLayout` and skip on-the-fly
 * measurement while scrolling. The bottom border is inside the box, keeping the
 * rendered height exactly equal to this constant.
 */
export const USER_ROW_HEIGHT = 72;

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
      // The id is passed back up rather than closing over a navigation call,
      // so the parent can keep one stable callback for every row.
      onPress={() => onPress(user.id)}
      style={styles.row}
    />
  );
}

/**
 * Memoised: without this every row re-renders on each page append and on every
 * keystroke in the search field.
 */
export const UserListItem = memo(UserListItemComponent);

const styles = StyleSheet.create({
  row: {
    height: USER_ROW_HEIGHT,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
