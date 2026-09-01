/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 180_000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/CelebrateDemoRN.app',
      build:
        'xcodebuild -workspace ios/CelebrateDemoRN.xcworkspace -scheme CelebrateDemoRN -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build -quiet',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/CelebrateDemoRN.app',
      build:
        'xcodebuild -workspace ios/CelebrateDemoRN.xcworkspace -scheme CelebrateDemoRN -configuration Release -sdk iphonesimulator -derivedDataPath ios/build -quiet',
    },
    // Android needs two artifacts: the app itself and the instrumentation APK
    // that hosts the Detox test runner.
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      testBinaryPath:
        'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      // Scoped to :app deliberately. A bare `assembleAndroidTest` builds the
      // androidTest variant for every module, including third-party libraries,
      // where gesture-handler and react-android both ship libfbjni.so and the
      // native-lib merge fails on the duplicate.
      build:
        'cd android && ./gradlew :app:assembleDebug :app:assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081],
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      testBinaryPath:
        'android/app/build/outputs/apk/androidTest/release/app-release-androidTest.apk',
      build:
        'cd android && ./gradlew :app:assembleRelease :app:assembleAndroidTest -DtestBuildType=release',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 16' },
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Medium_Phone_API_36.1' },
    },
  },
  configurations: {
    // Debug configurations need Metro running; release builds are
    // self-contained and are what CI should use.
    'ios.sim.debug': { device: 'simulator', app: 'ios.debug' },
    'ios.sim.release': { device: 'simulator', app: 'ios.release' },
    'android.emu.debug': { device: 'emulator', app: 'android.debug' },
    'android.emu.release': { device: 'emulator', app: 'android.release' },
  },
};
