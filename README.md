# 東吳美食 SCU Cuisine

東吳大學校內餐廳訂餐平台（SvelteKit + Supabase），支援網頁與 Android APK。

## 開發

```sh
npm install
npm run dev
```

環境變數請複製 `.env.example` 為 `.env`，並填入 Supabase 設定。

## 建置網頁

```sh
npm run build
npm run preview
```

## 建置 Android APK

需安裝 [Android SDK](https://developer.android.com/studio) 並設定 `ANDROID_HOME`。

```powershell
.\scripts\build-apk.ps1
```

或：

```sh
npm run build
npx cap sync android
cd android && .\gradlew.bat assembleDebug
```

Debug APK 輸出：`android/app/build/outputs/apk/debug/app-debug.apk`

## 技術棧

- [SvelteKit](https://kit.svelte.dev/)（SPA，`adapter-static`）
- [Capacitor](https://capacitorjs.com/)（Android）
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
