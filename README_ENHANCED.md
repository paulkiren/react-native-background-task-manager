# Enhanced React Native Foreground Service

This enhanced version combines the modern Android compliance of `react-native-foreground-services` with the advanced task management capabilities of `@kirenpaul/rn-foreground-service`.

## 🚀 New Features

### ✨ Advanced Task Management
- **Parallel task execution** with priority queuing
- **Task scheduling** with delays and intervals
- **Task lifecycle management** (success/error callbacks)
- **Task retry mechanisms** with configurable attempts
- **Task timeouts** for safety
- **Task persistence** across service restarts

### 🔔 Enhanced Notifications
- **Multiple action buttons** (up to 3 buttons)
- **Progress tracking** with determinate/indeterminate modes
- **Rich notification customization**
- **Action button handlers**
- **Notification sound and vibration control**

### 🛡️ Modern Android Compliance
- **Android 14+ foreground service types**
- **Notification permissions** (Android 13+)
- **Battery optimization handling**
- **Permission management**
- **Service type validation**

### 📊 Service Monitoring
- **Service metrics** (uptime, task counts, battery impact)
- **Task statistics** (running, completed, failed)
- **Service status tracking**
- **Performance monitoring**

## 📦 Installation

```bash
npm install react-native-foreground-service
# or
yarn add react-native-foreground-service
```

## 🔧 Setup

### Android Permissions

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- For Android 14+ -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROCESSING" />
```

### Service Declaration

```xml
<service
    android:name="com.reactnativeforegroundservice.ForegroundService"
    android:enabled="true"
    android:exported="false"
    android:foregroundServiceType="dataSync|mediaProcessing" />
```

## 🎯 Usage

### Basic Service with Enhanced Features

```typescript
import ForegroundService from 'react-native-foreground-service';

// Start enhanced service
await ForegroundService.startService({
  taskName: 'enhanced-sync',
  taskTitle: 'Data Synchronization',
  taskDesc: 'Syncing data with advanced features',
  serviceType: 'dataSync', // Required for Android 14+
  
  // Multiple action buttons
  actions: [
    { id: 'pause', title: 'Pause', icon: 'pause' },
    { id: 'settings', title: 'Settings', icon: 'settings' },
    { id: 'stop', title: 'Stop', icon: 'stop' }
  ],
  
  // Enhanced options
  color: '#007AFF',
  importance: 'HIGH',
  progress: { max: 100, curr: 0 },
  autoStop: false,
  timeoutMs: 300000, // 5 minutes
});
```

### Advanced Task Management

```typescript
// Add a high-priority task
const taskId = ForegroundService.TaskManager.addTask(
  async () => {
    // Your background task logic
    console.log('Executing background task...');
    
    // Simulate work with progress updates
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Update notification progress
      await ForegroundService.updateService({
        progress: { max: 100, curr: i }
      });
    }
    
    return 'task_completed';
  },
  {
    delay: 5000,           // Start after 5 seconds
    onLoop: true,          // Repeat the task
    priority: 'high',      // High priority execution
    retryCount: 3,         // Retry 3 times on failure
    timeout: 30000,        // 30 second timeout
    
    onSuccess: () => {
      console.log('✅ Task completed successfully');
    },
    
    onError: (error) => {
      console.error('❌ Task failed:', error);
    },
    
    onProgress: (progress) => {
      console.log(`📊 Progress: ${progress}%`);
    }
  }
);

// Manage tasks
ForegroundService.TaskManager.pauseTask(taskId);
ForegroundService.TaskManager.resumeTask(taskId);
ForegroundService.TaskManager.removeTask(taskId);

// Get task status
const taskStatus = ForegroundService.TaskManager.getTaskStatus(taskId);
console.log('Task status:', taskStatus);

// Get all tasks
const allTasks = ForegroundService.TaskManager.getAllTasks();
console.log('All tasks:', allTasks);
```

### Event Handling

```typescript
// Enhanced event listeners
ForegroundService.addEventListener({
  onServiceStart: () => {
    console.log('🚀 Service started');
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
        pauseAllTasks();
        break;
      case 'settings':
        openSettings();
        break;
      case 'stop':
        stopService();
        break;
    }
  },
  
  onTaskComplete: (taskId) => {
    console.log('✅ Task completed:', taskId);
  },
  
  onTaskError: (taskId, error) => {
    console.error('❌ Task error:', taskId, error);
  }
});
```

### Service Monitoring

```typescript
// Get detailed service status
const status = await ForegroundService.getServiceStatus();
console.log('Service status:', {
  isRunning: status.isRunning,
  uptime: status.uptime,
  taskCount: status.taskCount
});

// Get performance metrics
const metrics = await ForegroundService.getServiceMetrics();
console.log('Service metrics:', {
  tasksExecuted: metrics.tasksExecuted,
  tasksSucceeded: metrics.tasksSucceeded,
  tasksFailed: metrics.tasksFailed,
  batteryImpact: metrics.batteryImpact
});

// Get task statistics
const taskStats = ForegroundService.TaskManager.getStats();
console.log('Task statistics:', taskStats);
```

### Permission Management

```typescript
// Check and request permissions
const hasPermission = await ForegroundService.checkPermission();
if (!hasPermission) {
  const granted = await ForegroundService.requestPermission();
  if (!granted) {
    console.log('Permission denied');
    return;
  }
}

// Check notification permission (Android 13+)
const hasNotificationPermission = await ForegroundService.checkNotificationPermission();

// Check battery optimization
const batteryOptimized = await ForegroundService.checkBatteryOptimization();
if (!batteryOptimized) {
  await ForegroundService.requestBatteryOptimizationExemption();
}
```

### Headless Task Integration

```typescript
// Register headless tasks
ForegroundService.registerForegroundTask('myBackgroundTask', async () => {
  console.log('Headless task running');
  
  // Your background logic here
  await performBackgroundWork();
});

// Run registered tasks
await ForegroundService.runTask({
  taskName: 'myBackgroundTask',
  delay: 1000,
  onLoop: true
});
```

## 📱 Complete Example

```typescript
import React, { useEffect, useState } from 'react';
import { View, Button, Alert } from 'react-native';
import ForegroundService from 'react-native-foreground-service';

export default function App() {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setupService();
    return () => ForegroundService.removeEventListener();
  }, []);

  const setupService = async () => {
    // Setup event listeners
    ForegroundService.addEventListener({
      onServiceStart: () => setIsRunning(true),
      onServiceStop: () => setIsRunning(false),
      onActionPress: handleAction,
    });

    // Check service status
    const running = await ForegroundService.isServiceRunning();
    setIsRunning(running);
  };

  const handleAction = (actionId) => {
    switch (actionId) {
      case 'pause':
        // Pause all tasks
        const tasks = ForegroundService.TaskManager.getAllTasks();
        Object.keys(tasks).forEach(taskId => {
          ForegroundService.TaskManager.pauseTask(taskId);
        });
        break;
        
      case 'stop':
        stopService();
        break;
    }
  };

  const startService = async () => {
    try {
      await ForegroundService.startService({
        taskName: 'demo-service',
        taskTitle: 'Demo Service',
        taskDesc: 'Demonstrating enhanced features',
        serviceType: 'dataSync',
        actions: [
          { id: 'pause', title: 'Pause' },
          { id: 'stop', title: 'Stop' }
        ],
        progress: { max: 100, curr: 0 }
      });

      // Add background task
      ForegroundService.TaskManager.addTask(
        async () => {
          console.log('Background task running...');
          
          // Update progress
          for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            await ForegroundService.updateService({
              progress: { max: 100, curr: i }
            });
          }
        },
        {
          delay: 2000,
          onLoop: true,
          priority: 'high'
        }
      );

    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const stopService = async () => {
    try {
      await ForegroundService.stopServiceAll();
      ForegroundService.TaskManager.removeAllTasks();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Button
        title={isRunning ? 'Stop Service' : 'Start Service'}
        onPress={isRunning ? stopService : startService}
      />
    </View>
  );
}
```

## 🔧 API Reference

### ForegroundService

| Method | Description | Returns |
|--------|-------------|---------|
| `startService(options)` | Start foreground service | `Promise<void>` |
| `stopService()` | Stop foreground service | `Promise<void>` |
| `stopServiceAll()` | Force stop all instances | `Promise<void>` |
| `updateService(options)` | Update notification | `Promise<void>` |
| `isServiceRunning()` | Check if service is running | `Promise<boolean>` |
| `getServiceCount()` | Get service instance count | `Promise<number>` |
| `getServiceStatus()` | Get detailed service status | `Promise<ServiceStatus>` |
| `getServiceMetrics()` | Get performance metrics | `Promise<ServiceMetrics>` |
| `checkPermission()` | Check all permissions | `Promise<boolean>` |
| `requestPermission()` | Request permissions | `Promise<boolean>` |
| `addEventListener(listener)` | Add event listeners | `void` |
| `removeEventListener()` | Remove event listeners | `void` |

### TaskManager

| Method | Description | Returns |
|--------|-------------|---------|
| `addTask(task, config)` | Add new task | `string` (taskId) |
| `removeTask(taskId)` | Remove task | `void` |
| `updateTask(taskId, task, config)` | Update existing task | `void` |
| `pauseTask(taskId)` | Pause task | `void` |
| `resumeTask(taskId)` | Resume task | `void` |
| `isTaskRunning(taskId)` | Check if task is running | `boolean` |
| `getAllTasks()` | Get all tasks | `Record<string, TaskStatus>` |
| `getTaskStatus(taskId)` | Get task status | `TaskStatus \| null` |
| `removeAllTasks()` | Remove all tasks | `void` |
| `getStats()` | Get task statistics | `TaskStats` |

## 🚀 Migration from Legacy Library

If you're migrating from `@kirenpaul/rn-foreground-service`:

```typescript
// Old way
import ReactNativeForegroundService from '@kirenpaul/rn-foreground-service';

ReactNativeForegroundService.start({
  id: 1,
  title: 'Service',
  message: 'Running...',
  button: true,
  button2: true,
});

const taskId = ReactNativeForegroundService.add_task(myTask, {
  delay: 5000,
  onLoop: true
});

// New enhanced way
import ForegroundService from 'react-native-foreground-service';

await ForegroundService.startService({
  taskName: 'service',
  taskTitle: 'Service',
  taskDesc: 'Running...',
  serviceType: 'dataSync', // Required for Android 14+
  actions: [
    { id: 'action1', title: 'Action 1' },
    { id: 'action2', title: 'Action 2' }
  ]
});

const taskId = ForegroundService.TaskManager.addTask(myTask, {
  delay: 5000,
  onLoop: true,
  priority: 'normal',
  retryCount: 3
});
```

## 🔍 Troubleshooting

### Common Issues

1. **Service not starting on Android 14+**
   - Ensure you specify `serviceType` in options
   - Add appropriate permissions to AndroidManifest.xml

2. **Tasks not executing**
   - Check task configuration
   - Verify service is running
   - Check task status with `getTaskStatus()`

3. **Notification not showing**
   - Request notification permissions for Android 13+
   - Check notification channel settings

4. **Battery optimization**
   - Request battery optimization exemption
   - Guide users to whitelist your app

### Debug Mode

Enable debug logging:

```typescript
// Add debug logging
ForegroundService.addEventListener({
  onServiceStart: () => console.log('🚀 Service started'),
  onServiceStop: () => console.log('🛑 Service stopped'),
  onServiceError: (error) => console.error('❌ Error:', error),
  onTaskComplete: (taskId) => console.log('✅ Task done:', taskId),
  onTaskError: (taskId, error) => console.error('❌ Task error:', taskId, error),
});
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our GitHub repository.

## 📄 License

MIT License - see LICENSE file for details.

---

**Enhanced with ❤️ for the React Native community**
