import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, typography, type ColorToken, type TypographyVariant } from '@/theme/tokens';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
};

export function Text({ variant = 'body', color = 'textPrimary', align, style, ...rest }: TextProps) {
  return (
    <RNText
      style={[typography[variant], { color: colors[color] }, align ? { textAlign: align } : null, style]}
      {...rest}
    />
  );
}
