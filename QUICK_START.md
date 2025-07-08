# Quick Start Integration

## For Existing React Native Apps

Follow these simple steps to add foreground service capability to your existing React Native application:

## Step 1: Install

```bash
cd your-react-native-project
npm install react-native-background-task-manager
```

## Step 2: Update Android Configuration

### Modify `android/app/src/main/AndroidManifest.xml`

Add these lines to your existing AndroidManifest.xml:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Add these permissions after the <manifest> tag -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    
    <application>
        <!-- Your existing app configuration -->
        
        <!-- Add this service before closing </application> -->
        <service
            android:name="com.reactnativeforegroundservice.ForegroundService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="dataSync" />
    </application>
</manifest>
```

### Modify `android/app/src/main/java/.../MainApplication.java`

Add the import and package registration:

```java
// Add this import at the top
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

## Step 3: Use in Your Component

Create a new component or modify an existing one:

```typescript
// BackgroundTaskComponent.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import ForegroundService from 'react-native-background-task-manager';

const BackgroundTaskComponent = () => {
  const [isServiceRunning, setIsServiceRunning] = useState(false);

  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const running = await ForegroundService.isServiceRunning();
      setIsServiceRunning(running);
    } catch (error) {
      console.error('Error checking service status:', error);
    }
  };

  const startBackgroundTask = async () => {
    try {
      // Check permission first
      const hasPermission = await ForegroundService.checkPermission();
      if (!hasPermission) {
        await ForegroundService.requestPermission();
      }

      // Start the service
      await ForegroundService.startService({
        taskName: 'MyAppBackgroundTask',
        taskTitle: 'App Working in Background',
        taskDesc: 'Your app is processing data...',
        importance: 'DEFAULT',
        color: '#0066CC',
      });

      setIsServiceRunning(true);
      Alert.alert('Success', 'Background task started. Check your notifications!');
    } catch (error) {
      console.error('Error starting service:', error);
      Alert.alert('Error', 'Failed to start background task');
    }
  };

  const stopBackgroundTask = async () => {
    try {
      await ForegroundService.stopService();
      setIsServiceRunning(false);
      Alert.alert('Stopped', 'Background task stopped');
    } catch (error) {
      console.error('Error stopping service:', error);
      Alert.alert('Error', 'Failed to stop background task');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Background Service Demo</Text>
      
      <Text style={styles.status}>
        Status: {isServiceRunning ? '🟢 Running' : '🔴 Stopped'}
      </Text>

      <TouchableOpacity
        style={[styles.button, styles.startButton]}
        onPress={startBackgroundTask}
        disabled={isServiceRunning}
      >
        <Text style={styles.buttonText}>Start Background Task</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.stopButton]}
        onPress={stopBackgroundTask}
        disabled={!isServiceRunning}
      >
        <Text style={styles.buttonText}>Stop Background Task</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  status: {
    fontSize: 18,
    marginBottom: 30,
    color: '#666',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BackgroundTaskComponent;
```

## Step 4: Add to Your App

Import and use the component in your main App.js or App.tsx:

```typescript
// App.tsx
import React from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import BackgroundTaskComponent from './BackgroundTaskComponent';

const App = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle="dark-content" />
      <BackgroundTaskComponent />
    </SafeAreaView>
  );
};

export default App;
```

## Step 5: Test

1. **Run your app**: `npx react-native run-android`
2. **Tap "Start Background Task"** in your app
3. **Check the notification panel** - you should see a persistent notification
4. **Put the app in background** - the notification should remain
5. **Tap "Stop Background Task"** to clean up

## Real-World Example: File Upload

Here's a practical example for file uploading with progress:

```typescript
const uploadFilesWithProgress = async (files: File[]) => {
  try {
    // Start service with progress
    await ForegroundService.startService({
      taskName: 'FileUpload',
      taskTitle: 'Uploading Files',
      taskDesc: `Uploading 0/${files.length} files...`,
      importance: 'DEFAULT',
      button: true,
      buttonText: 'Cancel',
      color: '#FF9800',
      progress: {
        max: files.length,
        curr: 0,
        indeterminate: false,
      },
    });

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      // Check if service is still running (user might have cancelled)
      if (!await ForegroundService.isServiceRunning()) {
        break;
      }

      // Upload the file (your upload logic here)
      await uploadSingleFile(files[i]);

      // Update progress
      await ForegroundService.updateService({
        taskDesc: `Uploading ${i + 1}/${files.length} files...`,
        progress: {
          max: files.length,
          curr: i + 1,
          indeterminate: false,
        },
      });
    }

    // Clean up
    await ForegroundService.stopService();
    Alert.alert('Complete', 'All files uploaded successfully!');
  } catch (error) {
    await ForegroundService.stopService();
    Alert.alert('Error', 'Upload failed');
  }
};
```

## Testing Checklist

- [ ] App builds successfully
- [ ] No compilation errors
- [ ] Service starts without errors
- [ ] Notification appears in status bar
- [ ] Notification persists when app is backgrounded
- [ ] Service stops correctly
- [ ] No memory leaks or crashes

## Common Issues

### Build Errors
- Clean and rebuild: `cd android && ./gradlew clean && cd .. && npx react-native run-android`
- Check that all imports are correct
- Verify AndroidManifest.xml syntax

### Service Not Starting
- Check device logs: `npx react-native log-android`
- Ensure permissions are granted
- Test on a physical device (not emulator)

### Notification Not Showing
- Check notification permissions in device settings
- Try different importance levels
- Disable battery optimization for your app

That's it! Your React Native app now has foreground service capabilities. The service will keep running even when users switch to other apps, and they'll see a persistent notification indicating that your app is working in the background.
