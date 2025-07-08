# Quick Start Guide

## Overview

This guide will help you get started with React Native Background Task Manager in just a few minutes.

## Installation

```bash
npm install react-native-background-task-manager
```

## Basic Setup

### 1. Add Permissions (Android)

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />

<application>
  <!-- Your app content -->
  
  <service
      android:name="com.reactnativeforegroundservice.ForegroundService"
      android:enabled="true"
      android:exported="false"
      android:foregroundServiceType="dataSync" />
</application>
```

### 2. First Service

```typescript
import React from 'react';
import { View, Button } from 'react-native';
import ForegroundService from 'react-native-background-task-manager';

const MyComponent = () => {
  const startService = async () => {
    try {
      await ForegroundService.startService({
        taskName: 'MyFirstService',
        taskTitle: 'Background Task',
        taskDesc: 'Running in background...',
        serviceType: 'dataSync'
      });
      console.log('Service started!');
    } catch (error) {
      console.error('Failed to start service:', error);
    }
  };

  const stopService = async () => {
    await ForegroundService.stopService();
    console.log('Service stopped!');
  };

  return (
    <View>
      <Button title="Start Service" onPress={startService} />
      <Button title="Stop Service" onPress={stopService} />
    </View>
  );
};
```

## Common Use Cases

### 1. Data Sync Service

```typescript
await ForegroundService.startService({
  taskName: 'DataSync',
  taskTitle: 'Syncing Data',
  taskDesc: 'Synchronizing with server...',
  serviceType: 'dataSync',
  importance: 'DEFAULT',
  color: '#2196F3'
});
```

### 2. File Download with Progress

```typescript
await ForegroundService.startService({
  taskName: 'FileDownload',
  taskTitle: 'Downloading Files',
  taskDesc: 'Download in progress...',
  serviceType: 'dataSync',
  progress: {
    max: 100,
    curr: 0,
    indeterminate: false
  },
  actions: [
    { id: 'pause', title: 'Pause' },
    { id: 'cancel', title: 'Cancel' }
  ]
});

// Update progress
for (let i = 1; i <= 100; i++) {
  await ForegroundService.updateService({
    taskDesc: `Downloading... ${i}%`,
    progress: { max: 100, curr: i }
  });
  await new Promise(resolve => setTimeout(resolve, 100));
}
```

### 3. Background Tasks

```typescript
// Add a background task
const taskId = ForegroundService.TaskManager.addTask(
  async () => {
    console.log('Background task executed');
    // Your background logic here
  },
  {
    delay: 5000,        // Start after 5 seconds
    onLoop: true,       // Repeat the task
    priority: 'normal'  // Task priority
  }
);

// Get task statistics
const stats = ForegroundService.TaskManager.getStats();
console.log('Active tasks:', stats.runningTasks);
```

## Permission Handling

```typescript
const checkAndRequestPermissions = async () => {
  // Check current permissions
  const hasPermission = await ForegroundService.checkPermission();
  
  if (!hasPermission) {
    // Request permissions
    const granted = await ForegroundService.requestPermission();
    if (!granted) {
      console.log('Permissions denied');
      return false;
    }
  }
  
  // Check battery optimization
  const batteryOptimized = await ForegroundService.checkBatteryOptimization();
  if (!batteryOptimized) {
    await ForegroundService.requestBatteryOptimizationExemption();
  }
  
  return true;
};
```

## Event Handling

```typescript
// Setup event listeners
ForegroundService.addEventListener({
  onServiceStart: () => {
    console.log('✅ Service started');
  },
  onServiceStop: () => {
    console.log('🛑 Service stopped');
  },
  onServiceError: (error) => {
    console.error('❌ Service error:', error);
  },
  onActionPress: (actionId) => {
    console.log('🔘 Action pressed:', actionId);
    
    switch (actionId) {
      case 'pause':
        // Handle pause
        break;
      case 'cancel':
        ForegroundService.stopService();
        break;
    }
  }
});

// Don't forget to cleanup
useEffect(() => {
  return () => {
    ForegroundService.removeEventListener();
  };
}, []);
```

## Complete Example

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import ForegroundService from 'react-native-background-task-manager';

const CompleteExample = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermissions();
    setupEventListeners();
    
    return () => {
      ForegroundService.removeEventListener();
    };
  }, []);

  const checkPermissions = async () => {
    const permission = await ForegroundService.checkPermission();
    setHasPermission(permission);
  };

  const setupEventListeners = () => {
    ForegroundService.addEventListener({
      onServiceStart: () => setIsRunning(true),
      onServiceStop: () => setIsRunning(false),
      onServiceError: (error) => {
        Alert.alert('Service Error', error);
        setIsRunning(false);
      }
    });
  };

  const requestPermissions = async () => {
    const granted = await ForegroundService.requestPermission();
    setHasPermission(granted);
    
    if (!granted) {
      Alert.alert('Permission Required', 'Please grant permissions to use this feature');
    }
  };

  const startService = async () => {
    if (!hasPermission) {
      await requestPermissions();
      return;
    }

    try {
      await ForegroundService.startService({
        taskName: 'ExampleService',
        taskTitle: 'Example Service',
        taskDesc: 'Running example service...',
        serviceType: 'dataSync',
        importance: 'DEFAULT',
        color: '#4CAF50'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to start service');
    }
  };

  const stopService = async () => {
    await ForegroundService.stopService();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Service Status: {isRunning ? '🟢 Running' : '🔴 Stopped'}</Text>
      <Text>Permission: {hasPermission ? '✅ Granted' : '❌ Not Granted'}</Text>
      
      {!hasPermission && (
        <Button title="Request Permission" onPress={requestPermissions} />
      )}
      
      <Button 
        title={isRunning ? "Stop Service" : "Start Service"}
        onPress={isRunning ? stopService : startService}
        disabled={!hasPermission}
      />
    </View>
  );
};

export default CompleteExample;
```

## Next Steps

- 📖 Read the [Full API Documentation](./API.md)
- 🔧 Check the [Installation Guide](./INSTALLATION.md) for detailed setup
- 🎯 Explore [Advanced Features](./ADVANCED.md)
- 📱 See more [Examples](../example/)
- 🛠️ Learn [Best Practices](./BEST_PRACTICES.md)

## Need Help?

- 🐛 [Report Issues](https://github.com/paulkiren/react-native-background-task-manager/issues)
- 💬 [Join Discussions](https://github.com/paulkiren/react-native-background-task-manager/discussions)

