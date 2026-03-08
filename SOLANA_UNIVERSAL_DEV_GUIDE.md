# 🌌 Universal Solana Mobile & Expo Development Guide

This guide is a distillation of mission-critical knowledge for building Solana applications using Expo and React Native. It covers common "potholes," performance optimizations, and architectural patterns to ensure a professional-grade development experience.

---

## 🛠️ Environment & Setup

### 1. The Windows Path Limit (260 Characters)
**The Pothole**: Windows has a legacy file path limit. Android builds generate deep nested structures (especially in `.cxx` and `node_modules`). This leads to "File Not Found" errors that look like missing dependencies but are actually OS-level failures.
**The Solution**: Always initialize your project in a root-level directory with a short name (e.g., `C:\dev\my-app`). Never work inside `Desktop`, `Documents`, or deep folder structures.

### 2. NDK & Native Linkage (NDK 27+)
**The Pothole**: Modern React Native apps (0.74+) use newer NDKs that require explicit linkage for C++ shared libraries (`libc++_shared.so`). Without this, native modules like `react-native-quick-crypto` or `react-native-nitro-modules` will throw `UnsatisfiedLinkError` at runtime.
**The Solution**: 
- In `android/app/build.gradle`, ensure `externalNativeBuild` includes:
  ```gradle
  cppFlags "-DANDROID_STL=c++_shared"
  ```
- If dependencies like OpenSSL are missing, they must be manually extracted from their AAR and placed in `jniLibs`.

---

## 📱 Mobile Wallet Adapter (MWA)

### 1. Physical vs. Virtual
**The Pothole**: Emulators often fail to bridge correctly to wallet apps (Phantom, Solflare) and lack real secure hardware.
**The Solution**: **Always test on a physical device.** 
- Enable "Developer Options" and "USB Debugging".
- Enable "Testnet Mode" in your wallet app settings to allow transactions on Devnet.

### 2. Identity & Branding
**The Pothole**: Inconsistent naming or missing icons in the connection request leads to user distrust.
**The Solution**: Ensure the `identity` object in your `MobileWalletProvider` is consistent across the app:
```typescript
identity: {
  name: 'Your Project Name',
  uri: 'https://yourwebsite.com',
  icon: 'path/to/icon.png'
}
```

---

## 🌐 Networking & Connectivity

### 1. Cleartext Traffic (HTTP vs HTTPS)
**The Pothole**: Android blocks non-HTTPS traffic by default. If your local backend (Supabase, custom API) is running on `http://`, the app will fail silently or throw "Network request failed".
**The Solution**: In `AndroidManifest.xml`, add:
```xml
<application android:usesCleartextTraffic="true" ... />
```

### 2. Local Machine IP
**The Pothole**: Physical devices cannot reach `localhost` or `127.0.0.1`.
**The Solution**: Use your machine's local IPv4 address (e.g., `192.168.x.x` or `10.x.x.x`). 
- Bridge the connection using ADB: `adb reverse tcp:8081 tcp:8081`.

---

## 📦 Dependency Hardening

### 1. Version Matching
**The Pothole**: React Native `reanimated`, `worklets`, and `nitro-modules` are notoriously sensitive to version mismatches.
**The Solution**:
- Match `react-native-reanimated` with the specific Expo SDK requirement.
- Ensure `react-native-quick-crypto` is used if your app requires heavy cryptography (Solana key management), as it bridges to native OpenSSL for high speed.

### 2. Polyfills
**The Pothole**: Standard JS environments lack `Buffer`, `crypto`, and `BigInt` support needed for `@solana/web3.js`.
**The Solution**: Import your polyfills at the very top of `index.js`:
```javascript
import './polyfill'; // Internal file with buffer/crypto polyfills
import 'expo-router/entry';
```

---

## 🚀 Future Agent Handover Tips
When a new AI agent takes over:
1. **Check ADB**: Run `adb devices` to ensure the phone is authorized.
2. **Reverse Ports**: Run `adb reverse tcp:8081 tcp:8081`.
3. **Trace Build**: If build fails, look at `.cxx` logs—it's usually a path length or NDK version issue.
4. **Logcat**: Use `adb logcat | Select-String "ReactNativeJS"` to see actual JS errors on the device.

---
**Shared Reference for All Solana Mobile Projects**
