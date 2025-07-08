# Frequently Asked Questions (FAQ)

## General Questions

### Q: What is React Native Background Task Manager?

**A:** It's a comprehensive React Native library that enables you to run foreground services on Android devices. It allows your app to perform long-running background tasks while displaying persistent notifications to users, ensuring compliance with Android's background execution limits.

### Q: Why do I need foreground services?

**A:** Android has strict limitations on background app execution to preserve battery life. Foreground services allow your app to:
- Continue running when the app is in the background
- Perform long-running tasks like data synchronization
- Show users that important work is happening
- Comply with Android's background execution policies

### Q: Does this work on iOS?

**A:** Currently, this library is Android-only. iOS support is planned for future releases. iOS has different background execution mechanisms that we're evaluating for integration.

## Installation & Setup

### Q: What are the minimum requirements?

**A:** 
- React Native 0.70.0 or higher
- Android API level 21 (Android 5.0) or higher  
- Node.js 16 or higher
- Java 11 or higher for Android development

### Q: Do I need to eject from Expo?

**A:** Yes, this library requires native Android code modifications, so it's not compatible with Expo managed workflow. You'll need to use Expo bare workflow or a standard React Native CLI project.

### Q: Why am I getting permission errors?

**A:** Make sure you've added all required permissions to your `AndroidManifest.xml` and are requesting them properly:

```typescript
// Check permissions first
const hasPermission = await ForegroundService.checkPermission();
if (!hasPermission) {
  const granted = await ForegroundService.requestPermission();
  // Handle permission result
}
```

## Android 14+ Compatibility

### Q: What's new in Android 14 for foreground services?

**A:** Android 14 (API 34) introduced stricter requirements:
- Service type declaration is mandatory
- Specific permissions for each service type
- Enhanced user consent requirements

### Q: Which service type should I use?

**A:** Choose based on your use case:
- `dataSync` - API calls, data synchronization
- `mediaProcessing` - Audio/video processing
- `location` - GPS tracking, navigation
- `camera` - Camera operations
- `microphone` - Audio recording

### Q: Can I use multiple service types?

**A:** Yes, declare multiple types in your manifest:

```xml
<service
    android:name="com.reactnativeforegroundservice.ForegroundService"
    android:foregroundServiceType="dataSync|mediaProcessing" />
```

## Common Issues

### Q: My service stops unexpectedly. Why?

**A:** This usually happens due to:
1. **Battery optimization** - Request exemption:
   ```typescript
   await ForegroundService.requestBatteryOptimizationExemption();
   ```
2. **Missing permissions** - Verify all permissions are granted
3. **Incorrect service type** - Ensure you're using the right type for your use case
4. **App being killed** - Use proper notification importance levels

### Q: Notifications aren't showing on Android 13+?

**A:** Android 13+ requires explicit notification permission:

```typescript
const hasNotificationPermission = await ForegroundService.checkNotificationPermission();
if (!hasNotificationPermission) {
  // Guide user to enable notifications in settings
}
```

### Q: How do I handle action button presses?

**A:** Use the event listener system:

```typescript
ForegroundService.addEventListener({
  onActionPress: (actionId) => {
    switch(actionId) {
      case 'pause':
        // Handle pause
        break;
      case 'stop':
        ForegroundService.stopService();
        break;
    }
  }
});
```

### Q: Can I update the notification while service is running?

**A:** Yes, use `updateService()`:

```typescript
await ForegroundService.updateService({
  taskDesc: 'Processing... 75%',
  progress: { max: 100, curr: 75 }
});
```

## Performance & Best Practices

### Q: How do I minimize battery usage?

**A:** Follow these best practices:
- Use appropriate service types, not generic ones
- Enable `autoStop` for finite tasks
- Set reasonable notification importance levels
- Request battery optimization exemption only when necessary
- Stop services when tasks complete

### Q: Can I run multiple services simultaneously?

**A:** While technically possible, it's not recommended. Instead:
- Use task management to handle multiple operations in one service
- Queue tasks using the TaskManager API
- Use different service instances only for truly different use cases

### Q: How do I test my implementation?

**A:** Test thoroughly:
- Test on various Android versions (especially 14+)
- Test with battery optimization enabled/disabled
- Test app killing scenarios
- Test permission grant/denial flows
- Use the built-in service metrics for monitoring

## Advanced Features

### Q: How does the TaskManager work?

**A:** TaskManager provides advanced task scheduling:

```typescript
import { TaskManager } from 'react-native-background-task-manager';

const taskId = TaskManager.addTask(
  async () => {
    // Your task logic
  },
  {
    delay: 5000,      // Initial delay
    onLoop: true,     // Repeat task
    priority: 'high', // Task priority
    retryCount: 3     // Retry on failure
  }
);
```

### Q: Can I get service performance metrics?

**A:** Yes, use `getServiceMetrics()`:

```typescript
const metrics = await ForegroundService.getServiceMetrics();
console.log(`Uptime: ${metrics.uptime}ms`);
console.log(`Battery impact: ${metrics.batteryImpact}`);
```

### Q: How do I handle service lifecycle events?

**A:** Register event listeners:

```typescript
ForegroundService.addEventListener({
  onServiceStart: () => console.log('Service started'),
  onServiceStop: () => console.log('Service stopped'),
  onServiceError: (error) => console.error('Service error:', error),
  onTaskComplete: (taskId) => console.log(`Task ${taskId} completed`)
});
```

## Migration & Updates

### Q: How do I migrate from version 0.x?

**A:** See our [Migration Guide](./MIGRATION.md) for detailed instructions. Key changes:
- Add `serviceType` to all service configurations
- Update permission handling
- Convert button configurations to actions array

### Q: How do I stay updated with new features?

**A:** 
- Watch the GitHub repository for releases
- Check the [Changelog](../CHANGELOG.md) for updates
- Follow our release notes for migration guides

## Troubleshooting

### Q: Where can I get help?

**A:** Multiple support channels available:
- 📖 [API Documentation](./API.md)
- 🐛 [GitHub Issues](https://github.com/paulkiren/react-native-background-task-manager/issues)
- 💬 [GitHub Discussions](https://github.com/paulkiren/react-native-background-task-manager/discussions)
- 📝 [Examples Collection](./EXAMPLES.md)

### Q: How do I report a bug?

**A:** When reporting bugs, please include:
- React Native version
- Android version and device model
- Complete error logs
- Minimal reproduction code
- Steps to reproduce the issue

### Q: Can I contribute to the project?

**A:** Absolutely! We welcome contributions. See our [Contributing Guide](../CONTRIBUTING.md) for details on:
- Code contributions
- Documentation improvements
- Example submissions
- Bug fixes and enhancements

---

**Didn't find your question here?** [Open a discussion](https://github.com/paulkiren/react-native-background-task-manager/discussions) and we'll help you out!
