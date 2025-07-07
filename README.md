# React Native Foreground Service

A React Native library for running foreground services on Android. This library allows your app to run tasks in the background while displaying a persistent notification to the user.

## Features

- ✅ Start and stop foreground services
- ✅ Update notification content and progress
- ✅ Customizable notifications with progress bars
- ✅ Action buttons in notifications
- ✅ Permission management
- ✅ TypeScript support
- ✅ Android 14+ compatible

## Installation

```bash
npm install react-native-foreground-service
# or
yarn add react-native-foreground-service
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
import ForegroundService from 'react-native-foreground-service';

// Start a foreground service
const startService = async () => {
  try {
    await ForegroundService.startService({
      taskName: 'MyBackgroundTask',
      taskTitle: 'Background Processing',
      taskDesc: 'Processing data in the background...',
    });
    console.log('Service started successfully');
  } catch (error) {
    console.error('Failed to start service:', error);
  }
};

// Stop the service
const stopService = async () => {
  try {
    await ForegroundService.stopService();
    console.log('Service stopped successfully');
  } catch (error) {
    console.error('Failed to stop service:', error);
  }
};

// Check if service is running
const checkService = async () => {
  const isRunning = await ForegroundService.isServiceRunning();
  console.log('Service is running:', isRunning);
};
```

### Advanced Usage with Progress

```typescript
import ForegroundService from 'react-native-foreground-service';

const processWithProgress = async () => {
  // Start service with progress bar
  await ForegroundService.startService({
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
    await ForegroundService.updateService({
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
  await ForegroundService.stopService();
};
```

### With Action Button

```typescript
await ForegroundService.startService({
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

### `startService(options: ForegroundServiceOptions): Promise<void>`

Starts the foreground service with the specified options.

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

Stops the currently running foreground service.

### `updateService(options: Partial<ForegroundServiceOptions>): Promise<void>`

Updates the notification content of the running service.

### `isServiceRunning(): Promise<boolean>`

Checks if the foreground service is currently running.

### `checkPermission(): Promise<boolean>`

Checks if the app has foreground service permission.

### `requestPermission(): Promise<boolean>`

Requests foreground service permission (automatically granted on Android 9+).

## Example App

Here's a complete example component:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import ForegroundService from 'react-native-foreground-service';

const ForegroundServiceExample = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    const running = await ForegroundService.isServiceRunning();
    setIsRunning(running);
  };

  const startDownload = async () => {
    await ForegroundService.startService({
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
      
      await ForegroundService.updateService({
        taskDesc: `Downloaded ${i}% of files`,
        progress: {
          max: 100,
          curr: i,
          indeterminate: false,
        },
      });
    }

    await ForegroundService.stopService();
    setIsRunning(false);
    setProgress(0);
  };

  const stopService = async () => {
    await ForegroundService.stopService();
    setIsRunning(false);
    setProgress(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Foreground Service Example</Text>
      <Text>Service Status: {isRunning ? 'Running' : 'Stopped'}</Text>
      <Text>Progress: {progress}%</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Start Download"
          onPress={startDownload}
          disabled={isRunning}
        />
        <Button
          title="Stop Service"
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

export default ForegroundServiceExample;
```

## Platform Support

- ✅ Android (API 21+)
- ❌ iOS (Foreground services are not applicable on iOS)

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
