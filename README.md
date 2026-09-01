# Users Directory — React Native

A small React Native app that lists users from the [DummyJSON Users API](https://dummyjson.com/docs/users),
with search, a detail screen, Reanimated-driven interactions, a reusable component layer,
unit/integration tests and Detox E2E coverage on both iOS and Android.

---

## Requirements

| Tool | Version used | Notes |
| --- | --- | --- |
| Node | 20.19.4+ | Expo SDK 54 minimum |
| JDK | 17 | Android Gradle builds (`brew install --cask zulu@17`) |
| Xcode | 16.4+ | iOS builds — see *Expo SDK choice* below |
| Ruby | 3.x or 4.x | **Not** macOS system Ruby (2.6) — see below |
| CocoaPods | 1.17+ | `pod install` for the iOS project |
| Android SDK | platform 36 + build-tools 36.x | plus one emulator AVD |
| applesimutils | latest | **Detox on iOS only**: `brew tap wix/brew && brew install applesimutils` |

Set these in your shell profile:

```bash
export JAVA_HOME="$(/usr/libexec/java_home -v 17)" && export ANDROID_HOME="$HOME/Library/Android/sdk" && export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"
```

---

## Setup

### Ruby and CocoaPods (iOS only)

macOS ships Ruby 2.6. Expo's CocoaPods integration calls `Array#filter_map`,
added in Ruby 2.7, so `pod install` fails on system Ruby with
`undefined method 'filter_map'`. On older CocoaPods it fails even earlier, with
`Unicode Normalization not appropriate for ASCII-8BIT`.

`.ruby-version` pins 4.0.1. With rbenv installed:

```bash
rbenv install -s "$(cat .ruby-version)" && gem install cocoapods
```

### Node dependencies

```bash
npm install
```

> `.npmrc` sets `legacy-peer-deps=true`. `@config-plugins/detox@11` — the latest release — still
> declares a peer of `expo@^53` while this project runs SDK 54. Its config mods apply cleanly;
> only the declared range is stale.
>
> That flag also disables automatic peer installation, so `react-native-worklets` — Reanimated 4's
> worklet runtime — is an explicit dependency. Without it `RNReanimated.podspec` aborts with
> "Failed to validate worklets version" and the iOS build cannot even configure.

The native `ios/` and `android/` directories are **not** committed — this project uses Expo's
Continuous Native Generation. Generate them with:

```bash
npx expo prebuild
```

---

## Running the app

```bash
npm run ios
```

```bash
npm run android
```

Both start Metro and build onto a simulator/emulator. For iOS you will need `cd ios && pod install`
after the first `prebuild`.

---

## Running unit / integration tests

```bash
npm test
```

```bash
npm run test:coverage
```

Jest + React Native Testing Library, with network mocked by **MSW**.

Three environment quirks are pinned down in `jest.config.js` and `src/test/mocks/server.ts`:

- **`msw/native`, not `msw/node`.** MSW's export map sets `./node` to `null` under the
  `react-native` condition that jest-expo resolves with, so `msw/node` cannot resolve at all.
- **`.mjs` needs its own transform.** `rettime` (an MSW transitive dependency) ships ESM only,
  and jest-expo's transform regex is `\.[jt]sx?$`.
- **`transformIgnorePatterns` must prefix-match.** Adding a trailing `/` stops `expo(nent)?`
  matching `expo-modules-core`.

Tests use **real timers**. Fake timers deadlock here: RNTL's `waitFor` drives the clock itself
while MSW resolves responses on the microtask queue, so the two starve each other. The debounce
is 350ms, so waiting it out is cheap and far less brittle.

---

## Running E2E tests (Detox)

One-time, per platform:

```bash
npx expo prebuild && cd ios && pod install && cd ..
```

Android emulator animations must be off or Detox's idle synchronisation will flake:

```bash
npm run e2e:android:prepare
```

Then, with a simulator/emulator booted:

```bash
npm run e2e:build:ios && npm run e2e:test:ios
```

```bash
npm run e2e:build:android && npm run e2e:test:android
```

Four Detox configurations exist (`ios.sim.debug|release`, `android.emu.debug|release`).
**Release** is the one to trust — debug builds depend on a running Metro server, which adds a
whole class of flake. Android produces two artifacts (the app APK and the instrumentation APK),
which is why its config carries a `testBinaryPath` and iOS does not.

The device targets in `.detoxrc.js` (`iPhone 16`, AVD `Medium_Phone_API_36.1`) may need changing
to match locally available devices.

### E2E coverage

`e2e/users.e2e.ts` covers the required flow: launch → list loads → search filters → tap a row →
detail opens → drive an animated element and assert something observable.

The **expand/collapse section** is what the animation assertion targets, not the collapsing
header. A tap-driven reveal has a binary visible/not-visible outcome; asserting a header
mid-collapse would depend on scroll physics and produce a flaky test. The collapsing header is
covered separately by scrolling and asserting the compact title has cross-faded in.

---

## Architecture

```
src/
  navigation/     RootNavigator + typed RootStackParamList
  providers/      AppProviders — query client, safe area, gesture handler
  features/
    users/
      api/        endpoints, DTOs, DTO→domain mappers
      hooks/      useUsersList (list + search), useUserSearch, useUserDetail
      components/ UserListItem, UserDetailHeader
      screens/    UsersListScreen, UserDetailScreen
  ui/             design system — Text, Button, Touchable, Avatar, ListItem,
                  Screen, DetailSection, DetailField, states/
  theme/          design tokens
  lib/            httpClient, queryClient, testIDs, useDebouncedValue, listPerformance
  test/           MSW handlers, fixtures, render helper
e2e/              Detox specs
```

Three rules hold the structure together:

1. **`ui/` knows nothing about users.** It imports only from `theme/`, which is what makes it a
   design system rather than a folder of screen fragments.
2. **`api/` returns domain models, not DTOs.** An API shape change is absorbed by one mapper file
   instead of rippling into components.
3. **No feature code branches on `Platform`.** Every platform difference is resolved inside
   `theme/` or `ui/` — see below.

### Cross-platform strategy

Platform divergence is confined to two places:

- `theme/tokens.ts` — iOS `shadow*` vs Android `elevation`, and pinned type faces so the two
  builds stay visually comparable rather than inheriting San Francisco vs Roboto metrics.
- `ui/Touchable.tsx` — Android ripple vs iOS opacity, behind one component.

Plus `ui/Screen.tsx` for safe-area insets and status bar, and `lib/listPerformance.ts` for
`removeClippedSubviews` (a win on Android, historically a source of blank cells on iOS).

Screens and feature components contain zero `Platform` checks.

---

## Key decisions & tradeoffs

**Data fetching — TanStack Query.** `useInfiniteQuery` provides pagination, caching, retry and
loading/error state out of the box. Redux Toolkit or a hand-rolled reducer would be materially
more code for less behaviour on what is a read-only feed. Query keys live in one `usersKeys`
factory so cache invalidation has a single vocabulary.

**Search — the platform's own control, server-side, debounced 350ms.** Search is declared via
`headerSearchBarOptions`, which `react-native-screens` implements with `UISearchController` on
iOS and `androidx` `SearchView` on Android. That yields each platform's native behaviour —
iOS's Cancel button and clear affordance, Android's collapse-to-icon and back-button dismissal,
plus correct accessibility traits — rather than a hand-rolled text field that would look
identical on both and therefore be native to neither.

DummyJSON's `/users/search` paginates identically to `/users`, so one `useInfiniteQuery` serves
both browsing and searching, differing only by key and fetcher. Client-side filtering was
rejected: it can only ever search the pages already loaded, which silently misrepresents what
exists in a 208-record dataset. `keepPreviousData` holds the previous results on screen while a
new query resolves, so the list never flashes empty between keystrokes.

The cost is testability. `SearchBarProps` exposes no `testID`, so the field is unreachable from
React Native Testing Library and needs a native-type matcher in Detox. Search behaviour is
therefore tested at its two real seams — `useUserSearch` for debouncing and `useUsersList` for
list-vs-search fetching — which isolates the logic better than driving it through screen chrome
did. `e2e/users.e2e.ts` carries the single platform branch, in one clearly commented helper.

**Navigation carries only an id.** The detail screen fetches by id rather than receiving a list
summary. That keeps routes serialisable (deep links, state restoration) and guarantees the detail
view is never rendered from stale data.

**Error handling.** `httpClient` throws `ApiError` / `NetworkError` / `TimeoutError` rather than
leaking status codes, so screens branch on intent. The query client only retries what could
plausibly succeed — a 404 surfaces immediately instead of after three attempts. Each surface has
an explicit loading, error-with-retry and empty state.

`AbortSignal.any` is deliberately **not** used to combine the timeout and cancellation signals:
React Native replaces the global `AbortSignal` with the `abort-controller` ponyfill, which does
not implement it. It would typecheck, pass in Jest under Node, and then throw on device.

**Performance.** Rows are memoised with a fixed height, so the list supplies `getItemLayout` and
skips measurement. Row callbacks are stable (`useCallback`) so memoisation is not defeated on
every keystroke. Only the fields the row renders are requested via `?select=`, cutting both
transfer and parse cost. Avatars use `expo-image` with memory+disk caching.

**Sensitive fields are never mapped.** `/users/{id}` returns `password`, `ssn`, `bank` and
`crypto`. The mapper does not carry them into the domain model, so they cannot reach the UI by
accident — even though this is a mock API.

**Expo SDK 54, not the latest.** SDK 57 (RN 0.86) builds `ExpoModulesJSI` through SwiftPM with
Swift tools 6.2, which ships only with Xcode 26 — and Xcode 26 requires Apple Silicon. On Xcode
16.4 / Swift 6.1 the iOS build fails at package resolution before compiling a line of app code:

```
package 'apple' is using Swift tools version 6.2.0 but the installed version is 6.1.0
```

SDK 54 targets Xcode 16.x and builds cleanly, so the project can be verified on both platforms
on the machine it was written on rather than assumed to work. The downgrade cost nothing
architecturally — only `package.json` changed, no application code — and SDK 54 still ships
Reanimated 4, so the animation approach is unaffected.

**No `babel.config.js`.** Reanimated 4 moved worklets to `react-native-worklets`, and
`babel-preset-expo` auto-injects that plugin. Adding the old `react-native-reanimated/plugin`
entry manually would double-register it.

**Static theme tokens, no `useTheme()` hook.** A hook returning one immutable object is
indirection that buys nothing until a second theme exists. Migration path if dark mode is added:
swap token imports for a context read; the token shape does not change.

---

## What I would improve with more time

- **Dark mode**, via the theme migration described above.
- **FlashList** instead of `FlatList` — unnecessary at 208 records, worth it past a few thousand.
- **Offline persistence** with `@tanstack/query-persist-client` so the list survives a cold start.
- **An error boundary + crash reporting** (Sentry) around each screen.
- **CI** running typecheck, lint, unit tests and both Detox suites on every PR.
- **A non-Play-Store AVD** for Detox. Play images are non-rootable, which rules out Test Butler
  for suppressing system dialogs; it is the first thing to try if Android E2E proves flaky.
- **Accessibility audit** — the components expose roles, labels and state, but this has not been
  verified with VoiceOver/TalkBack.
- **Skeleton loaders** instead of a centred spinner, to reduce perceived latency.
