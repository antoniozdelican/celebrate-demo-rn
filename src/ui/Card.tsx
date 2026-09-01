import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { colors, radii, shadow, spacing } from '@/theme/tokens';

export type CardProps = ViewProps & {
  /** `flat` drops the shadow for cards rendered inside an already-raised surface. */
  elevation?: 'flat' | 'raised';
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Card({ elevation = 'raised', padded = true, style, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        padded ? styles.padded : null,
        elevation === 'raised' ? shadow.sm : null,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
  },
  padded: { padding: spacing.lg },
});
