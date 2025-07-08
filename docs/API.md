# API Documentation

## Table of Contents

- [Core Methods](#core-methods)
- [Permission Management](#permission-management)
- [Service Information](#service-information)
- [Task Management](#task-management)
- [Event Handling](#event-handling)
- [Type Definitions](#type-definitions)
- [Examples](#examples)

## Core Methods

### startService(options)

Starts a foreground service with the specified configuration.

**Signature:**
```typescript
startService(options: ForegroundServiceOptions): Promise<void>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskName` | string | ✅ | Unique identifier for the task |
| `taskTitle` | string | ✅ | Title shown in the notification |
| `taskDesc` | string | ✅ | Description shown in the notification |
| `serviceType` | string | ✅ (Android 14+) | Service type: 'dataSync', 'mediaProcessing', etc. |
| `importance` | string | ❌ | Notification importance: 'NONE', 'MIN', 'LOW', 'DEFAULT', 'HIGH' |
| `progress` | object | ❌ | Progress configuration |
| `actions` | array | ❌ | Array of action button configurations |
| `color` | string | ❌ | Notification accent color (hex format) |
| `vibration` | boolean | ❌ | Enable notification vibration |
| `sound` | string | ❌ | Custom notification sound |

**Example:**
```typescript
await ForegroundService.startService({
  taskName: 'DataSync',
  taskTitle: 'Background Sync',
  taskDesc: 'Syncing data with server...',
  serviceType: 'dataSync',
  importance: 'DEFAULT',
  color: '#4CAF50',
  progress: {
    max: 100,
    curr: 0,
    indeterminate: false
  },
  actions: [
    { id: 'pause', title: 'Pause', icon: 'pause' },
    { id: 'stop', title: 'Stop', icon: 'stop' }
  ]
});
```

### stopService()

Stops the currently running foreground service.

**Signature:**
```typescript
stopService(): Promise<void>
```

**Example:**
```typescript
await ForegroundService.stopService();
```

### updateService(options)

Updates the notification content and progress of a running service.

**Signature:**
```typescript
updateService(options: Partial<ForegroundServiceOptions>): Promise<void>
```

**Example:**
```typescript
await ForegroundService.updateService({
  taskDesc: 'Processing... 50%',
  progress: { max: 100, curr: 50 }
});
```

### isServiceRunning()

Checks if the foreground service is currently running.

**Signature:**
```typescript
isServiceRunning(): Promise<boolean>
```

**Example:**
```typescript
const isRunning = await ForegroundService.isServiceRunning();
console.log('Service running:', isRunning);
```

## Permission Management

### checkPermission()

Checks if all required permissions are granted.

**Signature:**
```typescript
checkPermission(): Promise<boolean>
```

**Returns:** `true` if all permissions are granted, `false` otherwise.

### requestPermission()

Requests foreground service permissions from the user.

**Signature:**
```typescript
requestPermission(): Promise<boolean>
```

**Returns:** `true` if permissions were granted, `false` if denied.

### checkNotificationPermission()

Checks notification permission status (Android 13+).

**Signature:**
```typescript
checkNotificationPermission(): Promise<boolean>
```

### checkBatteryOptimization()

Checks if the app is exempted from battery optimization.

**Signature:**
```typescript
checkBatteryOptimization(): Promise<boolean>
```

### requestBatteryOptimizationExemption()

Requests battery optimization exemption from the user.

**Signature:**
```typescript
requestBatteryOptimizationExemption(): Promise<boolean>
```

## Service Information

### getServiceStatus()

Returns detailed information about the current service status.

**Signature:**
```typescript
getServiceStatus(): Promise<ServiceStatus>
```

**Returns:**
```typescript
interface ServiceStatus {
  isRunning: boolean;
  startTime?: number;
  serviceType?: string;
  notificationId?: number;
  uptime?: number;
  taskCount?: number;
}
```

### getServiceMetrics()

Returns performance metrics for the service.

**Signature:**
```typescript
getServiceMetrics(): Promise<ServiceMetrics>
```

**Returns:**
```typescript
interface ServiceMetrics {
  uptime: number;
  tasksExecuted: number;
  tasksSucceeded: number;
  tasksFailed: number;
  memoryUsage: number;
  batteryImpact: 'low' | 'medium' | 'high';
}
```

## Task Management

### TaskManager.addTask(task, config)

Adds a new background task to the task manager.

**Signature:**
```typescript
TaskManager.addTask(task: Function, config: TaskConfig): string
```

**Parameters:**
```typescript
interface TaskConfig {
  taskId?: string;
  delay: number;
  onLoop: boolean;
  priority?: 'low' | 'normal' | 'high';
  retryCount?: number;
  timeout?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}
```

**Returns:** Task ID string

### TaskManager.getStats()

Returns statistics about all managed tasks.

**Signature:**
```typescript
TaskManager.getStats(): TaskStats
```

**Returns:**
```typescript
interface TaskStats {
  totalTasks: number;
  runningTasks: number;
  pendingTasks: number;
  completedTasks: number;
  failedTasks: number;
}
```

## Event Handling

### addEventListener(listener)

Registers event listeners for service lifecycle events.

**Signature:**
```typescript
addEventListener(listener: ForegroundServiceEventListener): void
```

**Parameters:**
```typescript
interface ForegroundServiceEventListener {
  onServiceStart?: () => void;
  onServiceStop?: () => void;
  onServiceError?: (error: string) => void;
  onButtonPress?: (action: string) => void;
  onActionPress?: (actionId: string) => void;
  onTaskComplete?: (taskId: string) => void;
  onTaskError?: (taskId: string, error: string) => void;
}
```

### removeEventListener()

Removes all registered event listeners.

**Signature:**
```typescript
removeEventListener(): void
```

## Type Definitions

### ForegroundServiceOptions

```typescript
interface ForegroundServiceOptions {
  taskName: string;
  taskTitle: string;
  taskDesc: string;
  taskIcon?: string;
  importance?: 'NONE' | 'MIN' | 'LOW' | 'DEFAULT' | 'HIGH';
  number?: number;
  button?: boolean;
  buttonText?: string;
  buttonOnPress?: string;
  button2?: boolean;
  button2Text?: string;
  button2OnPress?: string;
  button3?: boolean;
  button3Text?: string;
  button3OnPress?: string;
  actions?: NotificationAction[];
  onActionPress?: (actionId: string) => void;
  mainOnPress?: string;
  vibration?: boolean;
  sound?: string;
  channel?: string;
  category?: string;
  visibility?: 'private' | 'public' | 'secret';
  largeIcon?: string;
  setOnlyAlertOnce?: boolean;
  color?: string;
  serviceType?: 'dataSync' | 'mediaProcessing' | 'location' | 'camera' | 'microphone' | 'phoneCall' | 'mediaPlayback' | 'remoteMessaging';
  progress?: {
    max: number;
    curr: number;
    indeterminate?: boolean;
  };
  foregroundServiceType?: string;
  autoStop?: boolean;
  timeoutMs?: number;
}
```

### NotificationAction

```typescript
interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
  actionType?: 'foreground' | 'background';
}
```

### TaskConfig

```typescript
interface TaskConfig {
  taskId?: string;
  delay: number;
  onLoop: boolean;
  priority?: 'low' | 'normal' | 'high';
  retryCount?: number;
  timeout?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}
```

## Examples

### Basic Service

```typescript
import ForegroundService from 'react-native-background-task-manager';

// Start basic service
await ForegroundService.startService({
  taskName: 'BasicSync',
  taskTitle: 'Data Sync',
  taskDesc: 'Syncing with server...',
  serviceType: 'dataSync'
});
```

### Service with Progress

```typescript
// Start with progress tracking
await ForegroundService.startService({
  taskName: 'FileProcessor',
  taskTitle: 'Processing Files',
  taskDesc: 'Processing media files...',
  serviceType: 'mediaProcessing',
  progress: {
    max: 100,
    curr: 0,
    indeterminate: false
  }
});

// Update progress
for (let i = 1; i <= 100; i++) {
  await ForegroundService.updateService({
    taskDesc: `Processing... ${i}%`,
    progress: { max: 100, curr: i }
  });
  await new Promise(resolve => setTimeout(resolve, 100));
}
```

### Task Management

```typescript
// Add a background task
const taskId = ForegroundService.TaskManager.addTask(
  async () => {
    // Background work
    console.log('Executing task...');
  },
  {
    delay: 5000,
    onLoop: true,
    priority: 'high',
    retryCount: 3,
    onSuccess: () => console.log('Task completed'),
    onError: (error) => console.error('Task failed:', error)
  }
);

// Get task statistics
const stats = ForegroundService.TaskManager.getStats();
console.log('Total tasks:', stats.totalTasks);
```

### Event Handling

```typescript
// Setup event listeners
ForegroundService.addEventListener({
  onServiceStart: () => {
    console.log('Service started');
  },
  onServiceStop: () => {
    console.log('Service stopped');
  },
  onActionPress: (actionId) => {
    switch (actionId) {
      case 'pause':
        console.log('Pause action pressed');
        break;
      case 'stop':
        console.log('Stop action pressed');
        ForegroundService.stopService();
        break;
    }
  }
});
```
