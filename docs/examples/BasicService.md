# Basic Service Example

This example demonstrates how to start a simple foreground service with minimal configuration.

## Complete Example

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import ForegroundService from 'react-native-background-task-manager';

const BasicServiceExample = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      // Check permissions
      const permission = await ForegroundService.checkPermission();
      setHasPermission(permission);
      
      // Check if service is running
      const running = await ForegroundService.isServiceRunning();
      setIsRunning(running);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const requestPermission = async () => {
    try {
      const granted = await ForegroundService.requestPermission();
      setHasPermission(granted);
      
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Foreground service permission is required for background tasks'
        );
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const startService = async () => {
    // Check permissions first
    if (!hasPermission) {
      await requestPermission();
      return;
    }

    try {
      await ForegroundService.startService({
        taskName: 'BasicBackgroundTask',
        taskTitle: 'Background Service',
        taskDesc: 'Service is running in the background',
        serviceType: 'dataSync', // Required for Android 14+
        importance: 'DEFAULT',
        color: '#4CAF50'
      });
      
      setIsRunning(true);
      Alert.alert('Success', 'Background service started successfully');
    } catch (error) {
      console.error('Error starting service:', error);
      Alert.alert('Error', `Failed to start service: ${error.message}`);
    }
  };

  const stopService = async () => {
    try {
      await ForegroundService.stopService();
      setIsRunning(false);
      Alert.alert('Success', 'Background service stopped');
    } catch (error) {
      console.error('Error stopping service:', error);
      Alert.alert('Error', `Failed to stop service: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Basic Service Example</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Permission: {hasPermission ? '✅ Granted' : '❌ Not Granted'}
        </Text>
        <Text style={styles.statusText}>
          Service: {isRunning ? '🟢 Running' : '🔴 Stopped'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {!hasPermission && (
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Request Permission</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            styles.startButton,
            (!hasPermission || isRunning) && styles.disabledButton
          ]}
          onPress={startService}
          disabled={!hasPermission || isRunning}
        >
          <Text style={styles.buttonText}>Start Service</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.stopButton,
            !isRunning && styles.disabledButton
          ]}
          onPress={stopService}
          disabled={!isRunning}
        >
          <Text style={styles.buttonText}>Stop Service</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BasicServiceExample;
```

## Required Android Setup

### Permissions in AndroidManifest.xml

```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
```

### Service Declaration

```xml
<application>
  <service
      android:name="com.reactnativeforegroundservice.ForegroundService"
      android:enabled="true"
      android:exported="false"
      android:foregroundServiceType="dataSync" />
</application>
```

## Key Features Demonstrated

### 1. Permission Management
- Check current permission status
- Request permissions when needed
- Handle permission denial gracefully

### 2. Service Lifecycle
- Start service with basic configuration
- Check service running status
- Stop service properly

### 3. Error Handling
- Try-catch blocks for all async operations
- User-friendly error messages
- Proper error logging

### 4. UI State Management
- Disable buttons based on service state
- Visual indicators for permission and service status
- Responsive user interface

## Best Practices Shown

1. **Always check permissions** before starting a service
2. **Handle errors gracefully** with try-catch blocks
3. **Provide user feedback** through alerts and UI updates
4. **Use appropriate service types** for Android 14+ compatibility
5. **Manage UI state** based on service status

## Next Steps

Once you have this basic example working:

- Try the [Progress Tracking Example](./ProgressTracking.md)
- Learn about [Action Buttons](./MultiButtonActions.md)
- Explore [Task Management](./TaskManagement.md)
- Check out [Real-world Use Cases](../EXAMPLES.md)
