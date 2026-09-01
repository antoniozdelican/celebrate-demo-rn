import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Design tokens.
 *
 * This module is the single source of truth for visual style, and the only
 * place in the app that is allowed to branch on `Platform`. Feature code and
 * screens consume semantic tokens, so iOS/Android differences (shadows vs
 * elevation, default type faces) are resolved once, here.
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
  /** iOS systemGray6-ish fill used by the search field. */
  searchField: '#EFEFF0',
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

/** 4pt spacing scale. */
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

/**
 * Type faces are pinned per platform so the two builds stay visually
 * comparable instead of inheriting San Francisco vs Roboto metrics.
 */
const fontFamily = Platform.select({
  ios: { regular: 'System', medium: 'System', bold: 'System' },
  default: { regular: 'sans-serif', medium: 'sans-serif-medium', bold: 'sans-serif' },
});

/**
 * Sizes follow the iOS text styles (Title1 / Title3 / Body / Headline /
 * Subheadline) so rows match the platform's own list metrics rather than
 * sitting a couple of points small.
 */
export const typography = {
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
  /** Body — 17pt, the iOS default reading size. */
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: -0.4,
  },
  /** Headline — 17pt semibold. Row titles, buttons. */
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  /** Subheadline — 15pt. Row subtitles, secondary text. */
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: -0.2,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/**
 * iOS draws shadows via shadow*, Android via elevation. Components consume
 * `shadow.md` and never branch themselves.
 */
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

/** Shared timing so animated surfaces feel consistent across the app. */
export const motion = {
  fast: 150,
  base: 220,
  slow: 320,
} as const;
