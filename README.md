# 🥗 Macros

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

An open-source, privacy-first, AI-powered nutrition tracker for Android. Log meals by text or camera, get personalized macro goals, and receive AI meal suggestions — all stored locally on your device.

## Features

- **Animated macro progress rings** — daily calories, protein, carbs and fats
- **AI meal analysis** — describe a meal or take a photo, Gemini extracts the macros
- **AI meal suggestions** — get meal ideas tailored to your remaining daily macros
- **Favorite meals** — save and re-log meals you eat often
- **Meal history** — browse past days
- **Personalized goals** — set up your profile once, Gemini calculates your targets
- **Fully local** — all data stays on your device (SQLite), API key stored in secure storage
- **Dark mode** support

## Screenshots

> Coming soon

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A [Gemini API key](https://aistudio.google.com/app/apikey) (free tier available)

### Install

```bash
git clone https://github.com/MarTCM/Macros.git
cd Macros
npm install
```

### Run (Expo Go)

```bash
npx expo start
```

Scan the QR code with the [Expo Go](https://expo.dev/client) app on your Android or iOS device.

### Build APK

```bash
npx expo prebuild --clean
cd android
./gradlew assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/app-release.apk`.

> **Note:** After a clean prebuild, recreate `android/local.properties` with your SDK path:
>
> ```
> sdk.dir=/path/to/your/android-sdk
> ```

## Setup

On first launch you'll be asked to:

1. Enter your **Gemini API key** — stored securely on-device, never sent anywhere except Google's Gemini API
2. Fill in your **profile** (name, age, weight, height, activity level, goal)
3. Gemini calculates your personalized daily macro targets

You can update both at any time in **Settings**.

## Tech Stack

|                |                                            |
| -------------- | ------------------------------------------ |
| Framework      | Expo SDK 54 + Expo Router v6               |
| UI             | React Native Paper v5 (MD3)                |
| Database       | expo-sqlite (WAL mode, migrations)         |
| AI             | Google Gemini 3.0 Flash Preview (`v1beta`) |
| Animations     | react-native-reanimated + react-native-svg |
| Secure storage | expo-secure-store                          |
| Camera         | expo-image-picker                          |

## Privacy

- **No account required**
- **No telemetry or analytics**
- **No data leaves your device** except Gemini API calls (meal text/image → Google)
- Your Gemini API key is stored in the OS keychain via `expo-secure-store`

## License

Copyright (C) 2026 MarTCM

This program is free software: you can redistribute it and/or modify it under the terms of the **GNU General Public License v3.0** as published by the Free Software Foundation.

See [LICENSE](./LICENSE) for the full license text.
