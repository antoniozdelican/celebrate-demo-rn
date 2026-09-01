import { StyleSheet, View } from 'react-native';

import { testIDs } from '@/lib/testIDs';
import { colors, spacing } from '@/theme/tokens';
import { Input } from '@/ui/Input';

export type UserSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  onClear: () => void;
};

/**
 * Sits above the list rather than inside it as a header, so it stays reachable
 * while scrolling and does not participate in cell recycling.
 */
export function UserSearchBar({ value, onChangeText, onClear }: UserSearchBarProps) {
  return (
    <View style={styles.container}>
      <Input
        testID={testIDs.usersList.searchInput}
        clearTestID={testIDs.usersList.searchClear}
        value={value}
        onChangeText={onChangeText}
        onClear={onClear}
        placeholder="Search users by name"
        accessibilityLabel="Search users"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
});
