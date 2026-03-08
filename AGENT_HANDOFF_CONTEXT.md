# Project LEGACY: Agent Handoff Context

## 1. Project Overview & Goal
**LEGACY** is a Solana-based, Mobile (React Native / Expo), AI-powered retro text RPG where players live a virtual life. 
They pay a SOL fee to be "born", make life choices generated dynamically by an AI Overlord (Groq LLM/Llama 3), see themselves as generated 3D pixel avatars (Fal.ai), and upon death, their final stats and obituary are permanently minted as an MPL-Core (Metaplex) NFT on the Solana blockchain. 
The backend leverages Next.js API routes, Supabase for DB, and Anchor/Rust for the Solana program (`legacy_engine`).

**Current Goal:** 
Get the React Native mobile app (the `legacy-app`) successfully building and running on a physical Android device via USB/ADB. We want the user to be able to open the app, connect their Mobile Wallet (Phantom / Solflare), pay the birth fee, play the game, and mint their death NFT on Devnet.

---

## 2. The Blocker
We are currently blocked by **Android Native Build/Linker issues (NDK 27)**. 
When the app launches on the physical Android device, it crashes on startup or throws a redbox error:
```text
java.lang.UnsatisfiedLinkError: dlopen failed: library "libquickcrypto.so" not found
```
(Sometimes it also complains about `libnitromodules.so` or `react_codegen_rnscreens.so` depending on the build).

### Root Cause Analysis So Far:
1. **NDK 27 C++ Linkage:** Android NDK 27+ removed implicit `c++_shared` linkage. Every native React Native module that uses C++ (like `react-native-quick-crypto`, `react-native-worklets-core`, `expo-modules-core`, `react-native-nitro-modules`) must now explicitly link against `c++_shared` in their respective `CMakeLists.txt`.
2. **Silent Linker Failures:** Even when we patch the `CMakeLists.txt` files of these libraries to include `target_link_libraries(... c++_shared)`, the `gradlew assembleDebug` build either silently skips building the `.so` files for them, or it fails to package them into the final APK's `stripped_native_libs` directory.
3. **Windows 260-Character Path Limit:** We were hitting path limits on Windows during CMake `arm64-v8a` compilation.

---

## 3. What We Have Tried (And The Current State)

### The Scaffold Migration (Currently running in `C:\dev\legacy`)
Because patching `node_modules` in the original `legacy-app` led to sticky `.cxx` CMake caches and codegen linker failures, we created a **fresh scaffold** using the official solana tool:
```bash
npx create-solana-dapp@latest web3js-expo --template expo
```
We created this in a root directory (`C:\dev\legacy`) to bypass the Windows path limits.

### Components Migrated into `C:\dev\legacy`:
- **Our UI Screens:** `app/index.tsx` (Home), `app/birth.tsx`, `app/active-life.tsx`, `app/death.tsx`, `app/graveyard.tsx`, `app/graveyard-[id].tsx`.
- **Hooks & Configs:** `utils/useWallet.ts` (wrapped the new `@wallet-ui/react-native-web3js` hook to match our legacy signatures), `utils/api.ts` (points to local network Supabase/Next.js backend running on the host machine).
- **Brand Assets:** Copied from `assets/` and updated `app.json` with the correct `name`, `slug`, `package`, and `icon` paths.
- **Dependencies Installed:** `bs58`, `react-native-quick-crypto`, `react-native-nitro-modules`, `@solana/web3.js`, `@wallet-ui/react-native-web3js`, `expo-av`, `expo-linear-gradient`, `react-native-worklets-core`.

### The CMake/Gradle Adjustments:
1. To bypass Windows path limits globally, we injected into `android/build.gradle`:
```gradle
subprojects {
  afterEvaluate { project ->
    if (project.hasProperty('android')) {
      project.android {
        externalNativeBuild {
          cmake { buildStagingDirectory new File("C:/tmp_cxx/${rootProject.name}/${project.name}") }
        }
      }
    }
  }
}
```
2. We tried passing `-DANDROID_STL=c++_shared` globally via the same `build.gradle`, but it seems `react-native-quick-crypto` still skips building the `.so`.

### The Current Execution State:
We were running:
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"; cd C:\dev\legacy\android; .\gradlew assembleDebug
```
And monitoring the output. We saw `quick-crypto` and `nitro-modules` start their CMake debug tasks (`:react-native-quick-crypto:buildCMakeDebug[arm64-v8a]`), but we need to see if they finish or if they throw linker errors.

---

## 4. Next Steps for the AI Agent

1. **Verify the APK contents:** Check if `/android/app/build/intermediates/stripped_native_libs/debug/out/lib/arm64-v8a` actually contains `libquickcrypto.so` and `libnitromodules.so` after a build finishes.
2. **Fix `quick-crypto` Linkage:** If the `.so` is missing, you may need to patch `node_modules/react-native-quick-crypto/android/CMakeLists.txt` and `node_modules/react-native-nitro-modules/android/CMakeLists.txt` and ensure `c++_shared` is linked. (Also check if `react-native-quick-crypto` `build.gradle` has some `packagingOptions { exclude ... }` that drops the library).
3. **Run the App on Device:** Once the APK packages `libquickcrypto.so` successfully, run `npm run android` in `C:\dev\legacy`.
4. **Test the Flow:** Ensure the MWA (Mobile Wallet Adapter) connects to Solana via Phantom/Solflare and the UI flows from Birth -> Death -> Mint.

*See `c:\Users\HP OMEN 15 GAMING\.gemini\antigravity\brain\873fd986-c5b4-40c4-85a0-8a1b6a51da3a\task.md` and `implementation_plan.md` for historical artifacts and the overall project checklist.*
