# Installation Guide

## Prerequisites

Before installing the React Native Background Task Manager, ensure you have:

- React Native 0.70.0 or higher
- Android SDK with API level 21 or higher
- Node.js 16 or higher
- Java 11 or higher (for Android development)

## Installation

### 1. Install the Package

Using npm:
```bash
npm install react-native-background-task-manager
```

Using yarn:
```bash
yarn add react-native-background-task-manager
```

### 2. Android Configuration

#### Add Permissions

Add the following permissions to your `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  
  <!-- Core foreground service permission -->
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
  
  <!-- Wake lock to keep device awake -->
  <uses-permission android:name="android.permission.WAKE_LOCK" />
  
  <!-- Android 13+ notification permission -->
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
  
  <!-- Android 14+ service type permissions -->
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROCESSING" />
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE_CAMERA" />
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE_PHONE_CALL" />
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
  
  <application ...>
    <!-- Your app content -->
    
    <!-- Add the foreground service -->
    <service
        android:name="com.reactnativeforegroundservice.ForegroundService"
        android:enabled="true"
        android:exported="false"
        android:foregroundServiceType="dataSync|mediaProcessing|location|camera|microphone|phoneCall|mediaPlayback" />
        
  </application>
</manifest>
```

#### Update build.gradle

Update your `android/app/build.gradle`:

```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        targetSdkVersion 34
        minSdkVersion 21
        // ... other configs
    }
    
    // ... rest of your configuration
}
```

#### Proguard Configuration

If you're using Proguard, add to your `android/app/proguard-rules.pro`:

```proguard
# React Native Background Task Manager
-keep class com.reactnativeforegroundservice.** { *; }
-dontwarn com.reactnativeforegroundservice.**

# Keep notification related classes
-keep class androidx.core.app.NotificationCompat** { *; }
-keep class android.app.Notification** { *; }
```

### 3. Auto-linking Verification

For React Native 0.60+, the package should auto-link. Verify by checking:

```bash
npx react-native config
```

If auto-linking doesn't work, manually link:

```bash
npx react-native link react-native-background-task-manager
```

### 4. Clean and Rebuild

After installation, clean and rebuild your project:

```bash
# Clean
cd android && ./gradlew clean && cd ..

# Rebuild
npx react-native run-android
```

## Platform-Specific Setup

### Android 14+ (API 34+) Requirements

For Android 14 and above, you must:

1. **Specify Service Type**: Always include `serviceType` when starting services
2. **Request Runtime Permissions**: Handle POST_NOTIFICATIONS permission
3. **Target SDK 34**: Update your app to target Android 14

Example runtime permission request:

```typescript
import { PermissionsAndroid, Platform } from 'react-native';
import ForegroundService from 'react-native-background-task-manager';

const requestPermissions = async () => {
  // Check foreground service permission
  const hasServicePermission = await ForegroundService.checkPermission();
  
  // Request notification permission for Android 13+
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const notificationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    
    if (notificationPermission !== PermissionsAndroid.RESULTS.GRANTED) {
      console.warn('Notification permission denied');
    }
  }
  
  // Request battery optimization exemption
  const batteryOptimized = await ForegroundService.checkBatteryOptimization();
  if (!batteryOptimized) {
    await ForegroundService.requestBatteryOptimizationExemption();
  }
  
  return hasServicePermission;
};
```

### Expo Configuration

If you're using Expo, add to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "minSdkVersion": 21
          }
        }
      ]
    ],
    "android": {
      "permissions": [
        "FOREGROUND_SERVICE",
        "WAKE_LOCK",
        "POST_NOTIFICATIONS",
        "FOREGROUND_SERVICE_DATA_SYNC",
        "FOREGROUND_SERVICE_MEDIA_PROCESSING"
      ]
    }
  }
}
```

## Verification

### Test Installation

Create a simple test to verify installation:

```typescript
import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import ForegroundService from 'react-native-background-task-manager';

const TestComponent = () => {
  useEffect(() => {
    console.log('ForegroundService imported successfully');
  }, []);

  const testService = async () => {
    try {
      const hasPermission = await ForegroundService.checkPermission();
      console.log('Permission check successful:', hasPermission);
      
      if (hasPermission) {
        await ForegroundService.startService({
          taskName: 'TestService',
          taskTitle: 'Test Service',
          taskDesc: 'Testing installation...',
          serviceType: 'dataSync'
        });
        
        console.log('Service started successfully');
        
        setTimeout(async () => {
          await ForegroundService.stopService();
          console.log('Service stopped successfully');
        }, 5000);
      }
    } catch (error) {
      console.error('Installation test failed:', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Installation Test</Text>
      <Button title="Test Service" onPress={testService} />
    </View>
  );
};

export default TestComponent;
```

### Check Service Status

```bash
# Check if service is running
adb shell dumpsys activity services | grep ForegroundService

# Check notification status
adb shell dumpsys notification | grep "react-native-background-task-manager"
```

## Troubleshooting

### Common Issues

#### 1. "Package not found" error
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear React Native cache
npx react-native start --reset-cache
```

#### 2. Auto-linking issues
```bash
# Manual linking
npx react-native unlink react-native-background-task-manager
npx react-native link react-native-background-task-manager

# Or use manual integration
```

#### 3. Android build errors
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Rebuild
npx react-native run-android
```

#### 4. Permission denied errors
- Ensure all required permissions are in AndroidManifest.xml
- Check targetSdkVersion is 34 for Android 14+ support
- Verify service declaration includes correct foregroundServiceType

#### 5. Service not starting on Android 14+
- Always include `serviceType` parameter
- Ensure corresponding permission is declared in manifest
- Check that notification permission is granted

### Debug Mode

Enable debug logging:

```typescript
// Add to your app's index.js
if (__DEV__) {
  console.log('[ForegroundService] Debug mode enabled');
  
  // Enable native logging
  if (Platform.OS === 'android') {
    // Android logs can be viewed with: adb logcat *:E ReactNative:V ReactNativeJS:V
  }
}
```

### Support

If you encounter issues:

1. Check the [troubleshooting guide](./TROUBLESHOOTING.md)
2. Search [existing issues](https://github.com/paulkiren/react-native-background-task-manager/react-native-background-task-manager/issues)
3. Create a [new issue](https://github.com/paulkiren/react-native-background-task-manager/react-native-background-task-manager/issues/new) with:
   - React Native version
   - Android version
   - Complete error logs
   - Minimal reproduction code

## Next Steps

After successful installation:

1. Read the [API Documentation](./API.md)
2. Check out the [examples](../example/)
3. Review the [best practices guide](./BEST_PRACTICES.md)
4. Explore [advanced usage](./ADVANCED.md)
