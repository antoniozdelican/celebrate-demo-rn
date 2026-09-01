import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme/tokens';
import { Text } from '@/ui/Text';
import { Touchable } from '@/ui/Touchable';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const HEIGHTS: Record<ButtonSize, number> = { sm: 34, md: 44, lg: 52 };
const PADDING: Record<ButtonSize, number> = { sm: spacing.md, lg: spacing.xl, md: spacing.lg };

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  testID,
}: ButtonProps) {
  // A loading button stays mounted but must not fire, so E2E taps during an
  // in-flight request cannot double-submit.
  const inactive = disabled || loading;

  return (
    <Touchable
      testID={testID}
      onPress={inactive ? undefined : onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      accessibilityLabel={label}
      style={[
        styles.base,
        styles[variant],
        { height: HEIGHTS[size], paddingHorizontal: PADDING[size] },
        fullWidth ? styles.fullWidth : null,
        inactive ? styles.inactive : null,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            testID={testID ? `${testID}-spinner` : undefined}
            size="small"
            color={variant === 'primary' ? colors.textInverse : colors.primary}
          />
        ) : (
          <Text
            variant="label"
            color={variant === 'primary' ? 'textInverse' : 'primary'}
            style={size === 'sm' ? typography.caption : undefined}
          >
            {label}
          </Text>
        )}
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primaryMuted },
  ghost: { backgroundColor: 'transparent' },
  fullWidth: { alignSelf: 'stretch' },
  inactive: { opacity: 0.5 },
});
