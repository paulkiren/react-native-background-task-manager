# Troubleshooting Guide

This guide covers common issues and their solutions when using React Native Background Task Manager.

## Common Issues

### 1. Permission Denied Errors

#### Symptoms
- Service fails to start
- Error: "Foreground service permission denied"
- App crashes when starting service

#### Solutions

**Check All Required Permissions:**
```typescript
const hasPermission = await ForegroundService.checkPermission();
if (!hasPermission) {
  const granted = await ForegroundService.requestPermission();
  if (!granted) {
    // Guide user to manually enable permissions
    Alert.alert(
      'Permission Required',
      'Please enable foreground service permission in Settings',
      [{ text: 'OK', onPress: () => Linking.openSettings() }]
    );
  }
}
```

**Verify AndroidManifest.xml:**
```xml
<!-- Ensure all required permissions are declared -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
```

### 2. Service Stops Unexpectedly

#### Symptoms
- Service starts but stops after a few minutes
- Notification disappears randomly
- Background tasks don't complete

#### Solutions

**Request Battery Optimization Exemption:**
```typescript
const isBatteryOptimized = await ForegroundService.checkBatteryOptimization();
if (!isBatteryOptimized) {
  await ForegroundService.requestBatteryOptimizationExemption();
}
```

**Use Appropriate Service Type:**
```typescript
// Use specific service types for Android 14+
await ForegroundService.startService({
  taskName: 'MyTask',
  taskTitle: 'Background Task',
  taskDesc: 'Running...',
  serviceType: 'dataSync', // Specific type
  importance: 'DEFAULT', // Important: Use DEFAULT or HIGH
});
```

**Set Auto-Stop for Finite Tasks:**
```typescript
await ForegroundService.startService({
  // ...other options
  autoStop: true,
  timeoutMs: 300000, // 5 minutes timeout
});
```

### 3. Notifications Not Showing (Android 13+)

#### Symptoms
- Service runs but no notification appears
- User doesn't see any indication of background activity

#### Solutions

**Check Notification Permissions:**
```typescript
// Android 13+ requires explicit notification permission
const hasNotificationPermission = await ForegroundService.checkNotificationPermission();
if (!hasNotificationPermission) {
  // Guide user to enable notifications
  Alert.alert(
    'Notifications Required',
    'Please enable notifications for this app to see service status',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Settings', onPress: () => Linking.openSettings() }
    ]
  );
}
```

**Set Proper Notification Importance:**
```typescript
await ForegroundService.startService({
  // ...other options
  importance: 'DEFAULT', // Use DEFAULT or HIGH for visibility
  color: '#4CAF50',
  vibration: false, // Disable for less intrusive notifications
});
```

### 4. Android 14+ Compliance Issues

#### Symptoms
- Error: "Service type not specified"
- Service fails to start on Android 14+
- Play Store rejection for targeting API 34+

#### Solutions

**Always Specify Service Type:**
```typescript
await ForegroundService.startService({
  taskName: 'MyTask',
  taskTitle: 'Background Task',
  taskDesc: 'Running...',
  serviceType: 'dataSync', // Required for Android 14+
});
```

**Add Required Permissions:**
```xml
<!-- Add specific permissions for your service type -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROCESSING" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
```

**Update Service Declaration:**
```xml
<service
    android:name="com.reactnativeforegroundservice.ForegroundService"
    android:enabled="true"
    android:exported="false"
    android:foregroundServiceType="dataSync|mediaProcessing" />
```

### 5. Task Manager Issues

#### Symptoms
- Tasks don't execute
- Task statistics show zero
- Error: "TaskManager not available"

#### Solutions

**Import TaskManager Correctly:**
```typescript
import { TaskManager } from 'react-native-background-task-manager';
// NOT: import TaskManager from 'react-native-background-task-manager';
```

**Ensure Service is Running:**
```typescript
// Start service before adding tasks
await ForegroundService.startService({
  taskName: 'TaskRunner',
  taskTitle: 'Running Tasks',
  taskDesc: 'Executing background tasks...',
  serviceType: 'dataSync',
});

// Then add tasks
const taskId = TaskManager.addTask(async () => {
  // Your task logic
}, {
  delay: 5000,
  onLoop: true
});
```

### 6. Memory and Performance Issues

#### Symptoms
- App becomes slow when service is running
- High memory usage
- Battery drain complaints

#### Solutions

**Optimize Task Execution:**
```typescript
TaskManager.addTask(async () => {
  // Process data in chunks
  const data = await fetchLargeDataSet();
  for (const chunk of data.chunks(100)) {
    await processChunk(chunk);
    // Give main thread a chance to breathe
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}, {
  delay: 10000, // Reasonable delays
  priority: 'low', // Use low priority for non-critical tasks
  timeout: 30000, // Set timeouts to prevent hanging
});
```

**Monitor Service Metrics:**
```typescript
const metrics = await ForegroundService.getServiceMetrics();
console.log('Memory usage:', metrics.memoryUsage);
console.log('Battery impact:', metrics.batteryImpact);

// Stop service if metrics are concerning
if (metrics.batteryImpact === 'high') {
  await ForegroundService.stopService();
}
```

### 7. Development and Testing Issues

#### Symptoms
- Service works in development but not in release
- Different behavior on different devices
- Inconsistent test results

#### Solutions

**Test on Multiple Devices:**
```bash
# Test on different Android versions
adb devices
# Deploy to each device and test
```

**Enable Debug Logging:**
```typescript
// Add comprehensive logging
ForegroundService.addEventListener({
  onServiceStart: () => console.log('Service started'),
  onServiceStop: () => console.log('Service stopped'),
  onServiceError: (error) => console.error('Service error:', error),
  onTaskComplete: (taskId) => console.log(`Task ${taskId} completed`),
  onTaskError: (taskId, error) => console.error(`Task ${taskId} failed:`, error),
});
```

**Validate Configuration:**
```typescript
// Validate before starting
const validateConfig = (options) => {
  if (!options.taskName) throw new Error('taskName is required');
  if (!options.taskTitle) throw new Error('taskTitle is required');
  if (!options.serviceType && Platform.Version >= 34) {
    throw new Error('serviceType is required for Android 14+');
  }
  return true;
};

try {
  validateConfig(serviceOptions);
  await ForegroundService.startService(serviceOptions);
} catch (error) {
  console.error('Configuration error:', error);
}
```

## Device-Specific Issues

### Samsung Devices

**Battery Optimization:**
- Samsung devices have aggressive battery optimization
- Always request exemption: `ForegroundService.requestBatteryOptimizationExemption()`
- Guide users to disable "Adaptive Battery" for your app

### Xiaomi/MIUI Devices

**Auto-Start Management:**
- MIUI blocks auto-start by default
- Guide users to enable auto-start in security settings
- Use high importance notifications: `importance: 'HIGH'`

### OnePlus/OxygenOS

**Background App Limits:**
- OxygenOS has strict background limits
- Use `autoStop: false` for persistent services
- Request users to disable "Advanced Optimization"

## Debugging Techniques

### 1. Enable Verbose Logging

```typescript
// Add comprehensive error handling
const startServiceWithLogging = async (options) => {
  try {
    console.log('Starting service with options:', options);
    
    const hasPermission = await ForegroundService.checkPermission();
    console.log('Permission status:', hasPermission);
    
    if (!hasPermission) {
      console.log('Requesting permission...');
      const granted = await ForegroundService.requestPermission();
      console.log('Permission granted:', granted);
    }
    
    await ForegroundService.startService(options);
    console.log('Service started successfully');
    
    const isRunning = await ForegroundService.isServiceRunning();
    console.log('Service running status:', isRunning);
    
  } catch (error) {
    console.error('Service start error:', error);
    console.error('Error stack:', error.stack);
  }
};
```

### 2. Monitor Service Health

```typescript
// Regular health checks
const monitorService = async () => {
  const status = await ForegroundService.getServiceStatus();
  const metrics = await ForegroundService.getServiceMetrics();
  
  console.log('Service Status:', {
    isRunning: status.isRunning,
    uptime: status.uptime,
    taskCount: status.taskCount,
    memoryUsage: metrics.memoryUsage,
    batteryImpact: metrics.batteryImpact
  });
  
  // Alert if metrics are concerning
  if (metrics.batteryImpact === 'high') {
    console.warn('High battery impact detected!');
  }
};

// Check every minute
setInterval(monitorService, 60000);
```

### 3. Test Error Scenarios

```typescript
// Test error handling
const testErrorScenarios = async () => {
  // Test without permissions
  try {
    await ForegroundService.startService({
      taskName: 'Test',
      taskTitle: 'Test',
      taskDesc: 'Test'
      // Missing serviceType for Android 14+
    });
  } catch (error) {
    console.log('Expected error caught:', error.message);
  }
  
  // Test invalid service type
  try {
    await ForegroundService.startService({
      taskName: 'Test',
      taskTitle: 'Test',
      taskDesc: 'Test',
      serviceType: 'invalid-type'
    });
  } catch (error) {
    console.log('Invalid service type error:', error.message);
  }
};
```

## Getting Help

If you're still experiencing issues:

1. **Check the FAQ:** [FAQ.md](./FAQ.md)
2. **Review Examples:** [EXAMPLES.md](./EXAMPLES.md)
3. **Check GitHub Issues:** Search for existing issues
4. **Create a Bug Report:** Include:
   - React Native version
   - Android version and device model
   - Complete error logs
   - Minimal reproduction code
   - Steps to reproduce

## Prevention Best Practices

1. **Always Check Permissions:** Before starting any service
2. **Use Appropriate Service Types:** Match service type to actual use case
3. **Handle Errors Gracefully:** Wrap all service calls in try-catch
4. **Test on Real Devices:** Emulators don't always reflect real behavior
5. **Monitor Performance:** Use service metrics to track impact
6. **Follow Android Guidelines:** Stay updated with Android documentation
7. **Progressive Enhancement:** Degrade gracefully when features aren't available
