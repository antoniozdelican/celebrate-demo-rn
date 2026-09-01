import {
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '@/theme/tokens';

export type TouchableProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** iOS press feedback. Ignored on Android, which uses ripple. */
  pressedOpacity?: number;
  rippleColor?: string;
  /** Android ripple that is not clipped to the view bounds (icon buttons). */
  borderlessRipple?: boolean;
};

/**
 * Press feedback differs per platform: Android uses a ripple, iOS dims.
 * Encapsulating it here means no screen or feature component has to know.
 */
export function Touchable({
  style,
  pressedOpacity = 0.6,
  rippleColor = colors.overlay,
  borderlessRipple = false,
  ...rest
}: TouchableProps) {
  return (
    <Pressable
      android_ripple={
        Platform.OS === 'android' ? { color: rippleColor, borderless: borderlessRipple } : undefined
      }
      style={({ pressed }) => [
        style,
        Platform.OS === 'ios' && pressed ? { opacity: pressedOpacity } : null,
      ]}
      {...rest}
    />
  );
}
