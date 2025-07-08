# Integration Guide

## Quick Setup for Existing React Native Apps

### 1. Install the package

```bash
npm install react-native-background-task-manager
# or
yarn add react-native-background-task-manager
```

### 2. Android Configuration

#### Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Add these permissions before the <application> tag -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />

<!-- Add this service inside the <application> tag -->
<application>
    <!-- ... your existing application content ... -->
    
    <service
        android:name="com.reactnativeforegroundservice.ForegroundService"
        android:enabled="true"
        android:exported="false"
        android:foregroundServiceType="dataSync" />
</application>
```

#### Register the package in `android/app/src/main/java/.../MainApplication.java`:

```java
import com.reactnativeforegroundservice.RNForegroundServicePackage;

public class MainApplication extends Application implements ReactApplication {

    @Override
    protected List<ReactPackage> getReactPackages() {
        @SuppressWarnings("UnnecessaryLocalVariable")
        List<ReactPackage> packages = new PackageList(this).getPackages();
        
        // Add this line:
        packages.add(new RNForegroundServicePackage());
        
        return packages;
    }
}
```

### 3. Usage in your component

```typescript
import ForegroundService from 'react-native-background-task-manager';

const YourComponent = () => {
  const startBackgroundTask = async () => {
    try {
      await ForegroundService.startService({
        taskName: 'DataSync',
        taskTitle: 'Syncing Data',
        taskDesc: 'Syncing your data in the background...',
        importance: 'DEFAULT',
      });
    } catch (error) {
      console.error('Failed to start service:', error);
    }
  };

  const stopBackgroundTask = async () => {
    try {
      await ForegroundService.stopService();
    } catch (error) {
      console.error('Failed to stop service:', error);
    }
  };

  return (
    // Your component JSX
  );
};
```

## Common Use Cases

### 1. File Upload/Download with Progress

```typescript
const uploadFiles = async (files) => {
  await ForegroundService.startService({
    taskName: 'FileUpload',
    taskTitle: 'Uploading Files',
    taskDesc: 'Uploading 0/' + files.length + ' files',
    button: true,
    buttonText: 'Cancel',
    progress: { max: files.length, curr: 0 },
  });

  for (let i = 0; i < files.length; i++) {
    // Upload logic here
    await uploadFile(files[i]);
    
    await ForegroundService.updateService({
      taskDesc: `Uploading ${i + 1}/${files.length} files`,
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
    setOnlyAlertOnce: true,
    progress: { max: 100, curr: 0, indeterminate: true },
  });

  try {
    // Your sync logic
    await performDataSync();
  } finally {
    await ForegroundService.stopService();
  }
};
```

### 3. Background Processing

```typescript
const processData = async (items) => {
  await ForegroundService.startService({
    taskName: 'DataProcessing',
    taskTitle: 'Processing Data',
    taskDesc: 'Processing items...',
    color: '#4CAF50',
    progress: { max: items.length, curr: 0 },
  });

  for (let i = 0; i < items.length; i++) {
    await processItem(items[i]);
    
    await ForegroundService.updateService({
      taskDesc: `Processed ${i + 1}/${items.length} items`,
      progress: { max: items.length, curr: i + 1 },
    });
  }

  await ForegroundService.stopService();
};
```

## Best Practices

1. **Always check permissions before starting**:
```typescript
const hasPermission = await ForegroundService.checkPermission();
if (!hasPermission) {
  await ForegroundService.requestPermission();
}
```

2. **Handle errors gracefully**:
```typescript
try {
  await ForegroundService.startService(options);
} catch (error) {
  console.error('Service error:', error);
  // Show user-friendly error message
}
```

3. **Clean up on app exit**:
```typescript
useEffect(() => {
  return () => {
    ForegroundService.stopService().catch(console.error);
  };
}, []);
```

4. **Update progress regularly**:
```typescript
// Update every significant progress step
if (progress % 10 === 0) {
  await ForegroundService.updateService({
    taskDesc: `Progress: ${progress}%`,
    progress: { max: 100, curr: progress },
  });
}
```

## Troubleshooting

### Service not starting
- Check AndroidManifest.xml permissions
- Verify service declaration
- Ensure package is registered

### Notification not visible
- Check if app has notification permissions
- Verify device is not in battery optimization mode
- Test with different importance levels

### Permission issues
- Ensure FOREGROUND_SERVICE permission is in manifest
- Check target SDK version compatibility
- Test on different Android versions
