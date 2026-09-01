import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * The only module allowed to branch on `Platform`. Feature code consumes
 * semantic tokens, so iOS/Android differences are resolved once, here.
 */

const palette = {
  white: '#FFFFFF',
  black: '#000000',
  grey50: '#F7F8FA',
  grey100: '#EEF0F4',
  grey200: '#E2E5EB',
  grey400: '#A7AEBB',
  grey600: '#5F6875',
  grey900: '#1B1F26',
  blue500: '#2F6BFF',
  blue600: '#2457D6',
  blue50: '#EAF1FF',
  red500: '#D93A3A',
  red50: '#FDECEC',
} as const;

export const colors = {
  background: palette.white,
  surface: palette.white,
  surfaceMuted: palette.grey100,
  searchField: '#EFEFF0',
  groupedCard: '#EFEFF0',
  border: palette.grey200,

  textPrimary: palette.grey900,
  textSecondary: palette.grey600,
  textDisabled: palette.grey400,
  textInverse: palette.white,

  primary: palette.blue500,
  primaryPressed: palette.blue600,
  primaryMuted: palette.blue50,

  danger: palette.red500,
  dangerMuted: palette.red50,

  chevron: '#C4C4C7',
  skeleton: palette.grey200,
  overlay: 'rgba(0,0,0,0.06)',
} as const;

export type ColorToken = keyof typeof colors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export type SpacingToken = keyof typeof spacing;

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

/** Pinned per platform so the builds don't diverge on SF vs Roboto metrics. */
const fontFamily = Platform.select({
  ios: { regular: 'System', medium: 'System', bold: 'System' },
  default: { regular: 'sans-serif', medium: 'sans-serif-medium', bold: 'sans-serif' },
});

/** Follows the iOS text styles so rows match the platform's list metrics. */
export const typography = {
  largeTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  heading: {
    fontFamily: fontFamily.medium,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: -0.4,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  sectionHeader: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    letterSpacing: 0.6,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: -0.2,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/** iOS shadow* vs Android elevation, resolved so components never branch. */
export const shadow = {
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    default: { elevation: 1 },
  }),
  md: Platform.select<ViewStyle>({
    ios: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    default: { elevation: 4 },
  }),
} as const;

export const motion = {
  fast: 150,
  base: 220,
  slow: 320,
} as const;
