# 🧊 Solana Mobile & Expo Development: The Definitive Guide & Handoff

This document captures the hard-earned lessons, "potholes," and architectural decisions made during the development of the **LEGACY** app. It is intended for future developers (and AI agents) to ensure continuity and prevent regression.

---

## 🚀 The Core Tech Stack
- **Framework**: Expo (SDK 54) + React Native (0.81.5)
- **Solana**: `@solana/web3.js` (v1), `@solana-mobile/mobile-wallet-adapter-protocol`
- **Native Bridge**: `react-native-quick-crypto`, `react-native-nitro-modules`, `react-native-worklets`
- **Styling**: Vanilla CSS/Tailwind (Configured for premium aesthetic)

---

## 🕳️ Avoid These Potholes (The "Death Traps")

### 1. The NDK 27 "UnsatisfiedLinkError" (CRITICAL)
**The Problem**: Modern React Native versions use NDK 27+, which changes how C++ shared libraries (`libc++_shared.so`) are linked. Many libraries like `react-native-quick-crypto` fail to find their dependencies (OpenSSL) at runtime.
**The Fix**:
- **Explicit Linking**: In `android/app/build.gradle`, you must inject `-DANDROID_STL=c++_shared` into the CMake arguments.
- **Manual Packaging**: If `libcrypto.so` or `libssl.so` are missing from the APK, they must be manually placed in `android/app/src/main/jniLibs/<arch>/`. We extracted these from the `io.github.ronickg:openssl` AAR.

### 2. Windows Path Length Limit (260 Characters)
**The Problem**: Windows has a 260-character limit on file paths. Android builds (especially CMake) generate extremely long paths that will cause the build to fail with cryptic "File Not Found" errors.
**The Fix**: **NEVER** build in deep folders like `C:\Users\Name\Desktop\...`. Always work from a root-level short path like `C:\dev\legacy`.

### 3. Physical Device Connection & Network
**The Problem**: Physical devices cannot see `localhost`. Emulators have flaky network bridges.
**The Fixes**:
- **ADB Reverse**: Always run `adb reverse tcp:8081 tcp:8081` to bridge the Metro server.
- **Cleartext Traffic**: Android blocks HTTP by default. You **MUST** have `android:usesCleartextTraffic="true"` in `AndroidManifest.xml` for local backend development (Supabase/Overseer).
- **IP Addressing**: In `utils/api.ts`, use your machine's local IP (e.g., `10.151.28.149`) rather than `localhost` or `10.0.2.2`.

### 4. Solana Mobile Wallet Adapter (MWA) Requirements
**The Problem**: Phantom/Solflare sometimes fail to connect or show "Incorrect Network."
**The Fixes**:
- **Identity Name**: The `identity` object in `MobileWalletProvider` must be consistent.
- **Devnet vs Testnet**: Phantom's "Testnet Mode" toggle in settings must be **ON** to allow Devnet connections.
- **Cluster IDs**: Strictly use `solana:devnet`.

---

## 🛠️ Essential Maintenance Commands

### Clear Cache & Fresh Build
If native code isn't updating or you get linker errors:
```powershell
# In android/ folder
.\gradlew clean
Remove-Item -Recurse -Force .cxx
Remove-Item -Recurse -Force app/build
.\gradlew assembleDebug
```

### Install & Launch
```powershell
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.beeman.web3jsexpo/.MainActivity
```

---

## 📦 Already Installed Dependencies
No need to re-download these; they are tuned for the current build:
- `react-native-reanimated` (~4.1.2) - Crucial for the premium UI.
- `react-native-quick-crypto` - Patched for NDK 27.
- `react-native-nitro-modules` - Base for native performance.
- `@wallet-ui/react-native-web3js` - UI components for Wallet interaction.

---

## 🗺️ Project Roadmap (Next Steps)
- [ ] **Finalize Wallet Flow**: Test the current "Birth" screen transaction on the physical device.
- [ ] **MPL-Core Integration**: Verify that NFTs minted via the backend appear correctly on `explorer.solana.com?cluster=devnet`.
- [ ] **Overseer Sync**: Ensure the `API_URL` changes allow real-time mission updates from the dashboard to the phone.

---
**Author**: Antigravity (Powered by DeepMind)
**Project**: LEGACY (Solana RPG Survival)
