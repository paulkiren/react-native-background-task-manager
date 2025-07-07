# React Native Background Task Manager

A powerful React Native library for managing background tasks on Android with foreground services, advanced scheduling, and geolocation support. Perfect for apps that need reliable background processing with persistent notifications.

## 🚀 Features

- ✅ **Background Task Management**: Advanced task scheduling with priorities and error handling
- ✅ **Foreground Services**: Reliable foreground service management for Android
- ✅ **Progress Tracking**: Real-time progress updates in notifications
- ✅ **Notification Actions**: Interactive buttons for user control
- ✅ **Geolocation Ready**: Perfect companion for location tracking apps
- ✅ **Permission Management**: Comprehensive permission handling
- ✅ **Battery Optimization**: Built-in battery optimization management
- ✅ **TypeScript Support**: Full TypeScript definitions
- ✅ **Android 14+ Compatible**: Supports latest Android requirements

## 📦 Installation

```bash
npm install react-native-background-task-manager
# or
yarn add react-native-background-task-manager
```

### React Native >= 0.60 (Auto-linking)

No additional steps required. The library will be linked automatically.

### React Native < 0.60 (Manual linking)

```bash
react-native link react-native-background-task-manager
```

### Android Setup

1. **Add permissions to your `android/app/src/main/AndroidManifest.xml`:**

```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

2. **Add the service declaration to your `android/app/src/main/AndroidManifest.xml` inside the `<application>` tag:**

```xml
<service
    android:name="com.reactnativeforegroundservice.ForegroundService"
    android:enabled="true"
    android:exported="false"
    android:foregroundServiceType="dataSync" />
```

3. **Register the package in `MainApplication.java`:**

```java
import com.reactnativeforegroundservice.RNForegroundServicePackage;

// In the getPackages() method
@Override
protected List<ReactPackage> getReactPackages() {
    return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new RNForegroundServicePackage() // Add this line
    );
}
```

## Usage

### Basic Usage

```typescript
import BackgroundTaskManager from 'react-native-background-task-manager';

// Start a background task with foreground service
const startService = async () => {
  try {
    await BackgroundTaskManager.startService({
      taskName: 'MyBackgroundTask',
      taskTitle: 'Background Processing',
      taskDesc: 'Processing data in the background...',
    });
    console.log('Background task started successfully');
  } catch (error) {
    console.error('Failed to start background task:', error);
  }
};

// Stop the service
const stopService = async () => {
  try {
    await BackgroundTaskManager.stopService();
    console.log('Background task stopped successfully');
  } catch (error) {
    console.error('Failed to stop background task:', error);
  }
};

// Check if service is running
const checkService = async () => {
  const isRunning = await BackgroundTaskManager.isServiceRunning();
  console.log('Background task is running:', isRunning);
};
```

### Advanced Usage with Progress

```typescript
import BackgroundTaskManager from 'react-native-background-task-manager';

const processWithProgress = async () => {
  // Start background task with progress bar
  await BackgroundTaskManager.startService({
    taskName: 'DataProcessing',
    taskTitle: 'Processing Files',
    taskDesc: 'Processing 0/100 files...',
    importance: 'DEFAULT',
    progress: {
      max: 100,
      curr: 0,
      indeterminate: false,
    },
  });

  // Simulate processing with progress updates
  for (let i = 1; i <= 100; i++) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
    
    // Update progress
    await BackgroundTaskManager.updateService({
      taskTitle: 'Processing Files',
      taskDesc: `Processing ${i}/100 files...`,
      progress: {
        max: 100,
        curr: i,
        indeterminate: false,
      },
    });
  }

  // Complete and stop service
  await BackgroundTaskManager.stopService();
};
```

### With Action Button

```typescript
await BackgroundTaskManager.startService({
  taskName: 'DownloadTask',
  taskTitle: 'Downloading Files',
  taskDesc: 'Download in progress...',
  button: true,
  buttonText: 'Cancel',
  buttonOnPress: 'cancel',
  color: '#FF6B6B',
});
```

## API Reference

### `startService(options: BackgroundTaskOptions): Promise<void>`

Starts a background task with foreground service and the specified options.

#### Options

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskName` | `string` | ✅ | Unique identifier for the task |
| `taskTitle` | `string` | ✅ | Title displayed in the notification |
| `taskDesc` | `string` | ✅ | Description displayed in the notification |
| `taskIcon` | `string` | ❌ | Custom icon resource name (default: app icon) |
| `importance` | `'NONE' \| 'MIN' \| 'LOW' \| 'DEFAULT' \| 'HIGH'` | ❌ | Notification importance level |
| `number` | `number` | ❌ | Badge number displayed on notification |
| `button` | `boolean` | ❌ | Whether to show action button |
| `buttonText` | `string` | ❌ | Text for the action button |
| `buttonOnPress` | `string` | ❌ | Action identifier for button press |
| `setOnlyAlertOnce` | `boolean` | ❌ | Only alert once for this notification |
| `color` | `string` | ❌ | Notification color (hex format) |
| `progress` | `ProgressOptions` | ❌ | Progress bar configuration |

#### Progress Options

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `max` | `number` | ✅ | Maximum progress value |
| `curr` | `number` | ✅ | Current progress value |
| `indeterminate` | `boolean` | ❌ | Whether progress is indeterminate |

### `stopService(): Promise<void>`

Stops the currently running background task and foreground service.

### `updateService(options: Partial<BackgroundTaskOptions>): Promise<void>`

Updates the notification content of the running background task.

### `isServiceRunning(): Promise<boolean>`

Checks if the background task with foreground service is currently running.

### `checkPermission(): Promise<boolean>`

Checks if the app has foreground service permission.

### `requestPermission(): Promise<boolean>`

Requests foreground service permission (automatically granted on Android 9+).

## Example App

Here's a complete example component:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import BackgroundTaskManager from 'react-native-background-task-manager';

const BackgroundTaskExample = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    const running = await BackgroundTaskManager.isServiceRunning();
    setIsRunning(running);
  };

  const startDownload = async () => {
    await BackgroundTaskManager.startService({
      taskName: 'FileDownload',
      taskTitle: 'Downloading Files',
      taskDesc: 'Starting download...',
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

    setIsRunning(true);
    simulateDownload();
  };

  const simulateDownload = async () => {
    for (let i = 1; i <= 100; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setProgress(i);
      
      await BackgroundTaskManager.updateService({
        taskDesc: `Downloaded ${i}% of files`,
        progress: {
          max: 100,
          curr: i,
          indeterminate: false,
        },
      });
    }

    await BackgroundTaskManager.stopService();
    setIsRunning(false);
    setProgress(0);
  };

  const stopService = async () => {
    await BackgroundTaskManager.stopService();
    setIsRunning(false);
    setProgress(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Background Task Manager Example</Text>
      <Text>Task Status: {isRunning ? 'Running' : 'Stopped'}</Text>
      <Text>Progress: {progress}%</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Start Download"
          onPress={startDownload}
          disabled={isRunning}
        />
        <Button
          title="Stop Task"
          onPress={stopService}
          disabled={!isRunning}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
});

export default BackgroundTaskExample;
```

## Platform Support

- ✅ Android (API 21+)
- ❌ iOS (Background task management with foreground services is Android-specific)

## Important Notes

1. **Android 14+ Requirements**: Make sure to declare the appropriate foreground service type in your AndroidManifest.xml.

2. **Permission**: The `FOREGROUND_SERVICE` permission is automatically granted for apps targeting API 28+.

3. **Battery Optimization**: Users may need to disable battery optimization for your app to ensure the service runs reliably.

4. **Service Types**: For Android 14+, you may need to specify the appropriate `foregroundServiceType` based on your use case.

## Troubleshooting

### Service not starting
- Ensure you've added the required permissions
- Check that the service is declared in AndroidManifest.xml
- Verify the package is registered in MainApplication.java

### Notification not showing
- Check notification permissions
- Verify the notification channel is created properly
- Ensure the app is not in battery optimization mode

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
