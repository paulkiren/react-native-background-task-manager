# React Native Foreground Service Library

## 📱 What is this?

This is a complete React Native library that enables Android apps to run foreground services. Foreground services allow your app to perform long-running tasks while displaying a persistent notification to the user, even when the app is in the background.

## 🚀 Key Features

- ✅ **Foreground Service Management**: Start, stop, and update foreground services
- ✅ **Rich Notifications**: Customizable notifications with progress bars, action buttons, and colors
- ✅ **Permission Handling**: Automatic permission checking and requesting
- ✅ **Progress Tracking**: Real-time progress updates with determinate and indeterminate modes
- ✅ **TypeScript Support**: Full TypeScript definitions included
- ✅ **Easy Integration**: Simple API that works with existing React Native apps
- ✅ **Android 14+ Compatible**: Supports latest Android requirements and targeting SDK 34
- ✅ **React Native 0.75+ Compatible**: Works with latest React Native versions
- ✅ **Runtime Permissions**: Handles Android 13+ notification permissions
- ✅ **Battery Optimization**: Built-in battery optimization checks

## 🆕 2025 Compatibility Updates

- **Android 14+ Support**: Full compliance with Android 14 foreground service requirements
- **React Native 0.75+**: Compatible with latest React Native architecture
- **Runtime Permissions**: Automatic handling of Android 13+ notification permissions
- **Service Types**: Proper foreground service type declarations
- **Battery Optimization**: Built-in checks for battery optimization settings
- **Policy Compliance**: Meets all current Google Play Store requirements

## 📦 Installation

### Step 1: Install the package

```bash
npm install react-native-foreground-service
# or
yarn add react-native-foreground-service
```

### Step 2: Link the library (React Native 0.60+ auto-links)

For React Native 0.59 and below, you'll need to manually link:

```bash
react-native link react-native-foreground-service
```

### Step 3: Configure Android (2025 Requirements)

#### Add permissions to `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Required for foreground services -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    
    <!-- Required for notifications on Android 13+ -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <!-- Optional: Add specific service types as needed -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROCESSING" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
    
    <application>
        <!-- Your existing application content -->
        
        <!-- Add this service declaration with proper service types -->
        <service
            android:name="com.reactnativeforegroundservice.ForegroundService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="dataSync|mediaProcessing" />
    </application>
</manifest>
```

#### Register the package in `MainApplication.java`:

```java
import com.reactnativeforegroundservice.RNForegroundServicePackage;

public class MainApplication extends Application implements ReactApplication {
    
    @Override
    protected List<ReactPackage> getReactPackages() {
        @SuppressWarnings("UnnecessaryLocalVariable")
        List<ReactPackage> packages = new PackageList(this).getPackages();
        
        // Add this line
        packages.add(new RNForegroundServicePackage());
        
        return packages;
    }
}
```

## 🔧 Usage (2025 Best Practices)

### Permission-First Example

```typescript
import React, { useEffect, useState } from 'react';
import { View, Button, Alert, Platform } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import ForegroundService from 'react-native-foreground-service';

const MyComponent = () => {
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    try {
      // Check foreground service permission
      const foregroundPermission = await ForegroundService.checkPermission();
      
      // Check notification permission (Android 13+)
      const notificationPermission = await ForegroundService.checkNotificationPermission();
      
      // Check battery optimization
      const batteryOptimization = await ForegroundService.checkBatteryOptimization();
      
      setHasPermissions(foregroundPermission && notificationPermission);
      
      if (!batteryOptimization) {
        Alert.alert(
          'Battery Optimization',
          'Please disable battery optimization for this app to ensure reliable background operation.'
        );
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestAllPermissions = async () => {
    try {
      // Request notification permission on Android 13+
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Required', 'Notification permission is required for background tasks.');
          return;
        }
      }

      // Check foreground service permission
      const foregroundGranted = await ForegroundService.requestPermission();
      if (!foregroundGranted) {
        Alert.alert('Permission Required', 'Foreground service permission is required.');
        return;
      }

      setHasPermissions(true);
      Alert.alert('Success', 'All permissions granted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  const startService = async () => {
    if (!hasPermissions) {
      await requestAllPermissions();
      return;
    }

    try {
      await ForegroundService.startService({
        taskName: 'MyBackgroundTask',
        taskTitle: 'App is working',
        taskDesc: 'Performing background operations...',
        importance: 'DEFAULT',
        serviceType: 'dataSync', // Required for Android 14+
      });
      Alert.alert('Service Started', 'Check your notification panel');
    } catch (error) {
      Alert.alert('Error', 'Failed to start service');
    }
  };

  const stopService = async () => {
    try {
      await ForegroundService.stopService();
      Alert.alert('Service Stopped');
    } catch (error) {
      Alert.alert('Error', 'Failed to stop service');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      {!hasPermissions && (
        <Button title="Request Permissions" onPress={requestAllPermissions} />
      )}
      <Button title="Start Service" onPress={startService} />
      <Button title="Stop Service" onPress={stopService} />
    </View>
  );
};
```

### Advanced Example with Progress

```typescript
import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import ForegroundService from 'react-native-foreground-service';

const AdvancedExample = () => {
  const [isRunning, setIsRunning] = useState(false);

  const startProgressTask = async () => {
    setIsRunning(true);
    
    // Start service with progress bar
    await ForegroundService.startService({
      taskName: 'FileProcessing',
      taskTitle: 'Processing Files',
      taskDesc: 'Starting process...',
      importance: 'DEFAULT',
      button: true,
      buttonText: 'Cancel',
      color: '#4CAF50',
      progress: {
        max: 100,
        curr: 0,
        indeterminate: false,
      },
    });

    // Simulate long-running task with progress updates
    for (let i = 1; i <= 100; i++) {
      if (!await ForegroundService.isServiceRunning()) {
        break; // Service was stopped
      }

      // Simulate work
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update progress
      await ForegroundService.updateService({
        taskDesc: `Processing... ${i}% complete`,
        progress: {
          max: 100,
          curr: i,
          indeterminate: false,
        },
      });
    }

    await ForegroundService.stopService();
    setIsRunning(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text>Service Status: {isRunning ? 'Running' : 'Stopped'}</Text>
      <Button 
        title="Start Progress Task" 
        onPress={startProgressTask}
        disabled={isRunning}
      />
    </View>
  );
};
```

## 📚 API Reference

### `startService(options: ForegroundServiceOptions): Promise<void>`

Starts a foreground service with the specified configuration.

**Options:**
- `taskName` (string, required): Unique identifier for the task
- `taskTitle` (string, required): Title shown in the notification
- `taskDesc` (string, required): Description shown in the notification
- `taskIcon` (string, optional): Custom icon resource name
- `importance` (string, optional): 'NONE' | 'MIN' | 'LOW' | 'DEFAULT' | 'HIGH'
- `button` (boolean, optional): Show action button in notification
- `buttonText` (string, optional): Text for the action button
- `color` (string, optional): Notification color (hex format)
- `progress` (object, optional): Progress bar configuration

### `stopService(): Promise<void>`

Stops the currently running foreground service.

### `updateService(options: Partial<ForegroundServiceOptions>): Promise<void>`

Updates the notification content of the running service.

### `isServiceRunning(): Promise<boolean>`

Checks if the foreground service is currently running.

### `checkPermission(): Promise<boolean>`

Checks if the app has foreground service permission.

### `requestPermission(): Promise<boolean>`

Requests foreground service permission.

## 💡 Common Use Cases

### 1. File Upload/Download

```typescript
const uploadFiles = async (files) => {
  await ForegroundService.startService({
    taskName: 'FileUpload',
    taskTitle: 'Uploading Files',
    taskDesc: 'Upload in progress...',
    button: true,
    buttonText: 'Cancel',
    progress: { max: files.length, curr: 0 },
  });

  for (let i = 0; i < files.length; i++) {
    await uploadFile(files[i]);
    await ForegroundService.updateService({
      taskDesc: `Uploaded ${i + 1}/${files.length} files`,
      progress: { max: files.length, curr: i + 1 },
    });
  }

  await ForegroundService.stopService();
};
```

### 2. Data Synchronization

```typescript
const syncData = async () => {
  await ForegroundService.startService({
    taskName: 'DataSync',
    taskTitle: 'Syncing Data',
    taskDesc: 'Synchronizing with server...',
    importance: 'LOW',
    progress: { max: 100, curr: 0, indeterminate: true },
  });

  try {
    await performDataSync();
  } finally {
    await ForegroundService.stopService();
  }
};
```

## 🔍 Troubleshooting

### Service not starting
- Ensure all permissions are added to AndroidManifest.xml
- Verify the service is declared in the manifest
- Check that the package is registered in MainApplication.java
- Test on a physical device (emulators may have limitations)

### Notification not showing
- Check if the app has notification permissions
- Verify the device is not in battery optimization mode
- Try different importance levels
- Ensure the notification channel is created properly

### Permission issues
- Make sure FOREGROUND_SERVICE permission is in the manifest
- Test on different Android versions (requirements vary)
- Check if the app is targeting the correct SDK version

## 📱 Testing

1. **Install the library** in your existing React Native app
2. **Add the configuration** as described above
3. **Use the example code** to test basic functionality
4. **Check the notification panel** when the service is running
5. **Test on different Android versions** to ensure compatibility

## 🌟 Benefits

- **Keep your app working** even when users switch to other apps
- **Show progress** for long-running operations
- **Improve user experience** with clear status indicators
- **Handle background tasks** reliably
- **Comply with Android guidelines** for background processing

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

This library provides everything you need to implement foreground services in your React Native Android app. The notification will persist in the status bar, keeping users informed about ongoing background operations.
