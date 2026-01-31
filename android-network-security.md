# Android Native Configuration Guide

This guide covers the manual configuration steps needed in Android Studio for the Capacitor Android build.

## 1. Network Security Configuration

To fix "Failed to fetch" errors on Android, you need to add a network security configuration.

### Steps:

#### 1.1 Create the network security config file

In your Android project, create this file:
`android/app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">lykukadtlhptlskrocux.supabase.co</domain>
        <trust-anchors>
            <certificates src="system"/>
        </trust-anchors>
    </domain-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system"/>
        </trust-anchors>
    </base-config>
</network-security-config>
```

#### 1.2 Update AndroidManifest.xml

In `android/app/src/main/AndroidManifest.xml`, add the network security config reference to the `<application>` tag:

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ... other attributes ...>
```

Also ensure you have these permissions:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

---

## 2. Google Maps Configuration

Google Maps may not display in the Android WebView without hardware acceleration enabled.

### Steps:

#### 2.1 Enable Hardware Acceleration

In `android/app/src/main/AndroidManifest.xml`, ensure the `<application>` tag includes `android:hardwareAccelerated="true"`:

```xml
<application
    android:hardwareAccelerated="true"
    android:usesCleartextTraffic="false"
    android:networkSecurityConfig="@xml/network_security_config"
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:supportsRtl="true"
    android:theme="@style/AppTheme">
```

**Note:** This is a Capacitor hybrid app using `@react-google-maps/api`, which uses the JavaScript/Web version of Google Maps. Therefore:
- Only a **Web API key** is required (same key works for iOS and Android)
- No separate Android API key with SHA-1 fingerprint is needed
- The Maps JavaScript API must be enabled in Google Cloud Console

---

## 3. After Making Changes

After making any of these changes:

1. Run `npx cap sync android`
2. Clean and rebuild in Android Studio (Build → Clean Project, then Build → Rebuild Project)
3. Run the app on emulator or device

---

## Complete AndroidManifest.xml Example

Here's what the key parts of your `AndroidManifest.xml` should look like:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="false"
        android:networkSecurityConfig="@xml/network_security_config"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:exported="true"
            android:launchMode="singleTask"
            android:name=".MainActivity"
            android:theme="@style/AppTheme.NoActionBarLaunch">
            
            <!-- intent filters... -->
            
        </activity>
    </application>
</manifest>
```
