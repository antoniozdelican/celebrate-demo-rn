import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, typography, type ColorToken, type TypographyVariant } from '@/theme/tokens';

export type TextProps = RNTextProps & {
  /** Typographic role. Maps to a token in `theme/typography`. */
  variant?: TypographyVariant;
  /** Semantic color token. */
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
};

/**
 * The only text primitive in the app. Screens never reach for RN's `Text`
 * directly, which keeps font scale and color on the token system.
 */
export function Text({ variant = 'body', color = 'textPrimary', align, style, ...rest }: TextProps) {
  return (
    <RNText
      style={[typography[variant], { color: colors[color] }, align ? { textAlign: align } : null, style]}
      {...rest}
    />
  );
}
