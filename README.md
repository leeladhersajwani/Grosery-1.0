
# Grocery Ledger (Expo React Native)

A simple, large-text ledger app for small grocery shops. Supports English/Hindi toggle, debit/credit entries for customers and sellers, local storage (AsyncStorage), and quick totals.

## Features
- Big buttons & text for easy use
- English/Hindi language switch
- Parties (customers/sellers) list
- Add entries with type (debit/credit), role (customer/seller), amount, note, date
- Ledger list & basic reports (totals & balance)
- Offline: data saved locally on device

## Run on your phone (no coding needed)
1. Install **Expo Go** from Google Play.
2. On your computer:
   ```bash
   npm install -g expo-cli
   ```
3. Extract this project and inside the folder run:
   ```bash
   npm install
   npx expo start
   ```
4. Scan the QR with Expo Go to preview the app.

## Build an APK (easy way via Expo EAS)
1. Create a free Expo account: https://expo.dev/signup
2. Inside this project, run:
   ```bash
   npm install
   npx expo login
   npx expo install
   npx expo prebuild
   npx expo run:android
   ```
   Or use EAS:
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   eas build -p android --profile preview
   ```
   This produces an **.apk or .aab** you can download from the Expo dashboard.

## Notes
- This starter avoids extra libraries to keep it simple for older phones.
- You can change the Android package id in `app.json` (`android.package`).

## Customize
- Change language strings in `/i18n/en.json` and `/i18n/hi.json`.
- UI is in `App.js` (single-file for simplicity).



## eas.json included
This project includes `eas.json` with a `preview` profile configured to build an **APK** (`android.buildType = "apk"`). Use the `preview` profile when building from the Expo dashboard or via `eas build --profile preview` to get an installable `.apk` file.
