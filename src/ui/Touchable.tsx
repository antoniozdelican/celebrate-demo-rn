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
  pressedOpacity?: number;
  rippleColor?: string;
  borderlessRipple?: boolean;
};

/** Android ripple vs iOS dim, so no feature component branches on Platform. */
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
