import { ExpoConfig } from 'expo/config';

const proguardRules = `
-keep public class com.horcrux.svg.** { *; }
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep public class com.dylanvann.fastimage.* {*;}
-keep public class com.dylanvann.fastimage.** {*;}
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}
-dontwarn javax.annotation.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase
-dontwarn org.codehaus.mojo.animal_sniffer.*
-dontwarn okhttp3.internal.platform.ConscryptPlatform
-dontwarn org.conscrypt.ConscryptHostnameVerifier
-keepclasseswithmembers,includedescriptorclasses class com.tencent.mmkv.** {
  native <methods>;
  long nativeHandle;
  private static *** onMMKVCRCCheckFail(***);
  private static *** onMMKVFileLengthError(***);
  private static *** mmkvLogImp(...);
  private static *** onContentChangedByOuterProcess(***);
}
-dontwarn org.slf4j.impl.StaticLoggerBinder
`;

const config: ExpoConfig = {
  "name": "Brace",
  "slug": "Bracedotto",
  "version": "0.0.0",
  "orientation": "default",
  "icon": "./src/images/icon.png",
  "scheme": "bracedotto",
  "userInterfaceStyle": "automatic",
  "backgroundColor": "#111827",
  "newArchEnabled": true,
  "splash": {
    "image": "./src/images/splash-icon-light.png",
    "resizeMode": "contain",
    "backgroundColor": "#ffffff"
  },
  "ios": {
    "icon": {
      "dark": "./src/images/ios-dark.png",
      "light": "./src/images/ios-light.png",
      "tinted": "./src/images/ios-tinted.png"
    },
    "supportsTablet": true,
    "infoPlist": {
      "NSPhotoLibraryUsageDescription": "Select a picture for use as a link's image.",
      "NSCameraUsageDescription": "Take a picture for use as a link's image."
    },
    "privacyManifests": {
      "NSPrivacyAccessedAPITypes": [
        {
          "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryFileTimestamp",
          "NSPrivacyAccessedAPITypeReasons": ["C617.1", "3B52.1"]
        },
        {
          "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
          "NSPrivacyAccessedAPITypeReasons": ["CA92.1", "1C8F.1"]
        },
        {
          "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategorySystemBootTime",
          "NSPrivacyAccessedAPITypeReasons": ["35F9.1"]
        }
      ]
    },
    "bundleIdentifier": "com.bracedotto.brace",
    "appleTeamId": process.env.APPLE_TEAM_ID,
    "version": "0.37.0",
    "buildNumber": "1"
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./src/images/adaptive-icon.png",
      "backgroundColor": "#ffffff"
    },
    "edgeToEdgeEnabled": true,
    "blockedPermissions": [
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.RECORD_AUDIO",
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.VIBRATE",
      "android.permission.WRITE_EXTERNAL_STORAGE"
    ],
    "package": "com.bracedotto",
    "versionCode": 66,
    "version": "0.36.0"
  },
  "web": {
    "bundler": "metro",
    "output": "static",
    "favicon": "./src/images/favicon.png"
  },
  "plugins": [
    [
      "expo-font",
      {
        "fonts": [
          "./src/fonts/Inter/Inter-BlackItalic.otf",
          "./src/fonts/Inter/Inter-Black.otf",
          "./src/fonts/Inter/Inter-BoldItalic.otf",
          "./src/fonts/Inter/Inter-Bold.otf",
          "./src/fonts/Inter/Inter-ExtraBoldItalic.otf",
          "./src/fonts/Inter/Inter-ExtraBold.otf",
          "./src/fonts/Inter/Inter-ExtraLightItalic.otf",
          "./src/fonts/Inter/Inter-ExtraLight.otf",
          "./src/fonts/Inter/Inter-Italic.otf",
          "./src/fonts/Inter/Inter-LightItalic.otf",
          "./src/fonts/Inter/Inter-Light.otf",
          "./src/fonts/Inter/Inter-MediumItalic.otf",
          "./src/fonts/Inter/Inter-Medium.otf",
          "./src/fonts/Inter/Inter-Regular.otf",
          "./src/fonts/Inter/Inter-SemiBoldItalic.otf",
          "./src/fonts/Inter/Inter-SemiBold.otf",
          "./src/fonts/Inter/Inter-ThinItalic.otf",
          "./src/fonts/Inter/Inter-Thin.otf"
        ]
      }
    ],
    [
      "expo-splash-screen",
      {
        "image": "./src/images/splash-icon-light.png",
        "imageWidth": 200,
        "resizeMode": "contain",
        "backgroundColor": "#ffffff",
        "dark": {
          "image": "./src/images/splash-icon-dark.png",
          "backgroundColor": "#111827"
        }
      }
    ],
    [
      "react-native-edge-to-edge",
      {
        "android": {
          "parentTheme": "Default",
          "enforceNavigationBarContrast": false
        }
      }
    ],
    "expo-router",
    "expo-localization",
    "./plugins/blockstack-plugin.ts",
    "expo-iap",
    [
      "expo-document-picker",
      {
        "iCloudContainerEnvironment": undefined,
        "kvStoreIdentifier": undefined,
      }
    ],
    [
      "expo-share-intent",
      {
        "iosActivationRules": {
          "NSExtensionActivationSupportsText": true,
          "NSExtensionActivationSupportsWebURLWithMaxCount": 1
        },
        "iosShareExtensionName": "Save to Brace",
        "iosAppGroupIdentifier": "group.bracedotto.share",
        "androidIntentFilters": ["text/*"]
      }
    ],
    [
      "expo-build-properties",
      {
        "ios": {
          "deploymentTarget": "15.5",
          // didn't work so do it in ./plugins/blockstack-plugin.ts
          //"extraPods": [
          //  {
          //    "name": "Blockstack",
          //    "git": "https://github.com/bracedotto/blockstack-ios.git",
          //    "commit": "5b4ffc1"
          //  }
          //],
          "privacyManifestAggregationEnabled": false
        },
        "android": {
          "minSdkVersion": 30,
          "enableProguardInReleaseBuilds": true,
          "extraProguardRules": proguardRules
        }
      }
    ]
  ],
  "experiments": {
    "typedRoutes": true
  }
}

export default config;
