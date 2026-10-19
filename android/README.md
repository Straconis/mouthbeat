# MouthBeat Android test app

An Android WebView shell for the bundled editor/player. Android 8.0 (API 26) or newer and a current Android System WebView are required. This is a debug prototype, not a store release.

## Build

Use JDK 17, Android SDK platform 36 and build-tools 36.0.0. Set `ANDROID_HOME` to the SDK, then run `./gradlew assembleDebug`. The Gradle wrapper downloads Gradle 8.11.1; Android Gradle Plugin is pinned to 8.10.1 and AndroidX WebKit to 1.14.0. Run `./gradlew lintDebug` for static checks. Web assets are copied from ../editor during the build, so there is one editor source.

APK output: app/build/outputs/apk/debug/app-debug.apk. Install on a connected phone with `adb install -r app/build/outputs/apk/debug/app-debug.apk`. Signing is with a development key; retain that key if you want future debug APKs to update the same installation. Never use it for production signing.

## Behavior

The app loads its assets with WebViewAssetLoader at an internal HTTPS origin. It has no INTERNET permission, microphone permission, broad file access, or JavaScript native bridge. External navigation and non-bundled resource requests are blocked. Browser service-worker registration is disabled in the Android shell because assets ship inside the APK. Pattern text import/export uses Android document pickers. Export includes code only, as in the browser prototype.

Playback stops when the Activity loses foreground focus or audio focus; returning does not automatically play. Draft autosave uses WebView local storage. App data removal or uninstallation removes drafts. Imported code is still JavaScript executing in the page and should be trusted. A current WebView with ES modules, Web Audio and AudioWorklet support is required. Native recording, audio export, background playback, billing and untrusted-code isolation are not implemented.

## Phone test checklist

- Fresh install in airplane mode: load all seven starters, Play/Update/Stop, hear drums and synths.
- Edit a note while playing; unchanged locations keep highlighting, and Update highlights the new code.
- Save/reopen a draft; import and export a .strudel file; cancel both document pickers.
- Rotate the phone and verify the saved draft; playback should stop during recreation.
- Home, screen lock, incoming calls and another app taking audio focus must stop playback.
- Check keyboard visibility, scrolling, text selection, touch targets, headphones and Bluetooth latency.

Build/static checks cannot establish these device behaviors. Record the phone/Android/WebView versions and results before promoting this prototype. AGPL-3.0-or-later; see ../LICENSE. The exact corresponding source and dependency/license review remain required before sharing outside private testing.

## Build validation (2026-10-19)

Debug assembly, APK v2 signature verification, and bundled-asset inspection succeeded. Android lint completed without errors, with warnings for the pinned toolchain/dependency versions, target API 35, JavaScript enablement, backup rules, and the missing custom launcher icon. These remain prototype limitations; JavaScript is required for Strudel and the shell exposes no native JavaScript bridge or Internet permission. No phone or emulator test has been performed.
