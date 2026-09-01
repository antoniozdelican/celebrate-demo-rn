import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme/tokens';
import { Text } from '@/ui/Text';
import { Touchable } from '@/ui/Touchable';

export type InputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  /** Renders a clear affordance when there is a value. */
  onClear?: () => void;
  clearTestID?: string;
};

/**
 * Presentational text field. It owns no state — the caller supplies
 * `value`/`onChangeText` — which keeps it reusable for search, forms, filters.
 */
export function Input({ label, onClear, clearTestID, value, ...rest }: InputProps) {
  const showClear = onClear !== undefined && typeof value === 'string' && value.length > 0;

  return (
    <View>
      {label ? (
        <Text variant="label" color="textSecondary" style={styles.label}>
          {label}
        </Text>
      ) : null}

      <View style={styles.field}>
        <TextInput
          value={value}
          style={styles.input}
          placeholderTextColor={colors.textDisabled}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          // Android draws its own underline on some OEM skins; the wrapper
          // View provides the border, so the input must not add another.
          underlineColorAndroid="transparent"
          {...rest}
        />

        {showClear ? (
          <Touchable
            testID={clearTestID}
            onPress={onClear}
            borderlessRipple
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={12}
            style={styles.clear}
          >
            <Text variant="label" color="textSecondary">
              ✕
            </Text>
          </Touchable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    // Height is set explicitly rather than via padding: Android and iOS
    // disagree on TextInput intrinsic height.
    height: 44,
    padding: 0,
  },
  clear: {
    paddingLeft: spacing.sm,
    height: 44,
    justifyContent: 'center',
  },
});
