import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii } from '@/theme/tokens';
import { Text } from '@/ui/Text';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export type AvatarProps = {
  uri?: string | null;
  /** Used to derive initials when no image is available. */
  name?: string;
  size?: AvatarSize;
  /** Let an animated parent drive the size — used by the collapsing header. */
  fill?: boolean;
  testID?: string;
};

const DIMENSIONS: Record<AvatarSize, number> = { sm: 32, md: 48, lg: 88, xl: 96 };

function initialsOf(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((part) => part.charAt(0).toUpperCase()).join('');
  return letters.length > 0 ? letters : '?';
}

/** Falls back to initials on a missing uri or a failed load. */
export function Avatar({ uri, name, size = 'md', fill = false, testID }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const dimension = DIMENSIONS[size];
  const box = fill
    ? ({ width: '100%', height: '100%', borderRadius: radii.pill } as const)
    : { width: dimension, height: dimension, borderRadius: radii.pill };

  if (!uri || failed) {
    return (
      <View testID={testID} style={[styles.fallback, box]}>
        <Text variant={size === 'lg' || size === 'xl' ? 'heading' : 'label'} color="textSecondary">
          {initialsOf(name)}
        </Text>
      </View>
    );
  }

  return (
    <Image
      testID={testID}
      source={{ uri }}
      style={[styles.image, box]}
      contentFit="cover"
      transition={120}
      cachePolicy="memory-disk"
      onError={() => setFailed(true)}
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.surfaceMuted },
  fallback: {
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
