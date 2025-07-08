# 🚀 React Native Background Task Manager

[![npm version](https://badge.fury.io/js/react-native-background-task-manager.svg)](https://badge.fury.io/js/react-native-background-task-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-android-green.svg)](https://developer.android.com)
[![React Native](https://img.shields.io/badge/React%20Native-0.70+-blue.svg)](https://reactnative.dev)
[![Android API](https://img.shields.io/badge/Android%20API-21+-brightgreen.svg)](https://developer.android.com/guide/topics/manifest/uses-sdk-element)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](https://jestjs.io)

> **The most comprehensive React Native library for managing foreground services with advanced task management, Android 14+ compliance, and enhanced notification capabilities.**

Perfect for apps that need to perform long-running background tasks like data synchronization, file processing, location tracking, or media processing while keeping users informed through rich, interactive notifications.

## ✨ Why Choose This Library?

### 🎯 Core Features

- 🔥 **Foreground Services** - Keep your app running in the background with persistent notifications
- 📱 **Rich Notifications** - Customizable notifications with actions, progress bars, and buttons  
- 🔄 **Advanced Task Management** - Task scheduling, prioritization, retry mechanisms, and lifecycle control
- 🛡️ **Android 14+ Ready** - Full compliance with latest Android requirements and service types
- ⚡ **Smart Permission Handling** - Automated permission requests and validation for all Android versions
- 🔋 **Battery Optimization** - Built-in battery optimization exemption handling
- 📊 **Service Metrics** - Real-time performance monitoring and detailed statistics
- 🏗️ **Production Ready** - Comprehensive test coverage, TypeScript support, and extensive documentation

### 🎨 Enhanced Capabilities

- 🎮 **Multiple Action Buttons** - Up to 3 interactive notification buttons with custom handlers
- 📈 **Progress Tracking** - Determinate and indeterminate progress indicators with real-time updates
- 🎵 **Custom Notifications** - Sounds, vibration, colors, and visual customization
- 🔗 **Event System** - Comprehensive event listeners for service lifecycle management
- 🧩 **Headless Tasks** - Background task execution support for React Native
- 📱 **Cross-Platform** - Seamlessly works on Android (iOS support planned)
- 🔒 **Type Safe** - Full TypeScript support with comprehensive type definitions

## 🚀 Quick Start

### 📦 Installation

```bash
npm install react-native-background-task-manager
# or
yarn add react-native-background-task-manager
```

### ⚡ Basic Usage

```typescript
import ForegroundService from 'react-native-background-task-manager';

// Start a basic foreground service
await ForegroundService.startService({
  taskName: 'MyBackgroundTask',
  taskTitle: 'Background Sync',
  taskDesc: 'Syncing data with server...',
  serviceType: 'dataSync', // Required for Android 14+
  importance: 'DEFAULT',
  color: '#4CAF50'
});

// Check if service is running
const isRunning = await ForegroundService.isServiceRunning();

// Stop the service
await ForegroundService.stopService();
```

### 🎨 Advanced Usage with Progress

```typescript
import ForegroundService from 'react-native-background-task-manager';

// Start service with progress tracking and action buttons
await ForegroundService.startService({
  taskName: 'FileProcessor',
  taskTitle: 'Processing Files',
  taskDesc: 'Processing media files...',
  serviceType: 'mediaProcessing',
  importance: 'HIGH',
  
  // Progress configuration
  progress: {
    max: 100,
    curr: 0,
    indeterminate: false
  },
  
  // Multiple action buttons
  actions: [
    { id: 'pause', title: 'Pause', icon: 'pause' },
    { id: 'settings', title: 'Settings', icon: 'settings' },
    { id: 'stop', title: 'Stop', icon: 'stop' }
  ],
  
  // Visual customization
  color: '#4CAF50',
  vibration: true,
  setOnlyAlertOnce: true,
  
  // Auto-stop after completion
  autoStop: true,
  timeoutMs: 300000 // 5 minutes timeout
});

// Update progress
await ForegroundService.updateService({
  taskDesc: 'Processing... 50%',
  progress: { max: 100, curr: 50 }
});

// Handle action button presses
ForegroundService.addEventListener({
  onActionPress: (actionId) => {
    switch(actionId) {
      case 'pause':
        // Handle pause action
        break;
      case 'stop':
        ForegroundService.stopService();
        break;
    }
  }
});
```

### 🔧 Task Management

```typescript
import { TaskManager } from 'react-native-background-task-manager';

// Add a recurring task
const taskId = TaskManager.addTask(
  async () => {
    // Your background task logic
    console.log('Executing background task...');
    await syncDataWithServer();
  },
  {
    delay: 5000,        // Initial delay
    onLoop: true,       // Repeat task
    priority: 'high',   // Task priority
    retryCount: 3,      // Retry on failure
    timeout: 30000,     // Task timeout
    onSuccess: () => console.log('Task completed successfully'),
    onError: (error) => console.error('Task failed:', error)
  }
);

// Get task statistics
const stats = TaskManager.getStats();
console.log(`Running tasks: ${stats.runningTasks}`);

// Control tasks
TaskManager.pauseTask(taskId);
TaskManager.resumeTask(taskId);
TaskManager.removeTask(taskId);
```

## 📚 Documentation

### 📖 Complete Guides

- **[📋 API Reference](./docs/API.md)** - Complete API documentation with examples
- **[🛠️ Installation Guide](./docs/INSTALLATION.md)** - Detailed setup instructions for Android
- **[⚡ Quick Start Guide](./docs/QUICK_START.md)** - Get up and running in minutes
- **[📝 Examples Collection](./docs/EXAMPLES.md)** - Real-world usage examples and demos
- **[❓ FAQ](./docs/FAQ.md)** - Frequently asked questions and solutions
- **[🔄 Migration Guide](./docs/MIGRATION.md)** - Upgrading from older versions

### 🔗 Quick Links

| Topic | Description | Link |
|-------|-------------|------|
| **Service Types** | Android 14+ service type requirements | [See Installation Guide](./docs/INSTALLATION.md#service-types) |
| **Permissions** | Required permissions and setup | [See Installation Guide](./docs/INSTALLATION.md#permissions) |
| **Troubleshooting** | Common issues and solutions | [See FAQ](./docs/FAQ.md) |
| **Examples** | Real-world usage examples | [See Examples](./docs/EXAMPLES.md) |

## 🛠️ Android Setup Requirements

### Required Permissions

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Core permissions -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.WAKE_LOCK" />

<!-- Android 14+ service type permissions -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROCESSING" />
<!-- Add other service types as needed -->
```

### Service Declaration

```xml
<application>
  <service
      android:name="com.reactnativeforegroundservice.ForegroundService"
      android:enabled="true"
      android:exported="false"
      android:foregroundServiceType="dataSync|mediaProcessing" />
</application>
```

**For complete setup instructions, see [Installation Guide](./docs/INSTALLATION.md)**

## 🔧 Android 14+ Service Types

| Service Type | Permission | Use Case |
|-------------|------------|----------|
| `dataSync` | `FOREGROUND_SERVICE_DATA_SYNC` | Data synchronization, API calls |
| `mediaProcessing` | `FOREGROUND_SERVICE_MEDIA_PROCESSING` | Audio/video processing |
| `location` | `FOREGROUND_SERVICE_LOCATION` | GPS tracking, location services |
| `camera` | `FOREGROUND_SERVICE_CAMERA` | Camera operations |
| `microphone` | `FOREGROUND_SERVICE_MICROPHONE` | Audio recording |
| `phoneCall` | `FOREGROUND_SERVICE_PHONE_CALL` | VoIP, calling features |

## 🎯 Real-World Examples

### 📊 Data Synchronization

```typescript
// Perfect for apps that sync data in the background
await ForegroundService.startService({
  taskName: 'DataSync',
  taskTitle: 'Syncing Data',
  taskDesc: 'Downloading latest updates...',
  serviceType: 'dataSync',
  importance: 'LOW',
  color: '#2196F3',
  progress: { max: 100, curr: 0 },
  autoStop: true
});
```

### 🎵 Media Processing

```typescript
// Ideal for audio/video processing apps
await ForegroundService.startService({
  taskName: 'AudioProcessor',
  taskTitle: 'Processing Audio',
  taskDesc: 'Converting audio files...',
  serviceType: 'mediaProcessing',
  importance: 'DEFAULT',
  actions: [
    { id: 'pause', title: 'Pause', icon: 'pause' },
    { id: 'cancel', title: 'Cancel', icon: 'close' }
  ],
  progress: { max: 100, curr: 0 }
});
```

### 📍 Location Tracking

```typescript
// Great for fitness, delivery, or tracking apps
await ForegroundService.startService({
  taskName: 'LocationTracker',
  taskTitle: 'Tracking Location',
  taskDesc: 'Recording your route...',
  serviceType: 'location',
  importance: 'DEFAULT',
  actions: [
    { id: 'stop', title: 'Stop Tracking', icon: 'stop' }
  ],
  color: '#4CAF50'
});
```

## 📈 Performance & Best Practices

### 🔋 Battery Optimization

- **Request Exemption:** Always request battery optimization exemption for critical services
- **Service Types:** Use specific service types instead of generic ones  
- **Auto-Stop:** Enable `autoStop` for finite tasks to prevent unnecessary battery drain

### 📱 User Experience

- **Clear Descriptions:** Use descriptive task titles and descriptions
- **Progress Updates:** Keep users informed with progress indicators
- **Action Buttons:** Provide pause/stop controls for better user control

### 🔧 Development Tips

- **Error Handling:** Always wrap service calls in try-catch blocks
- **Permission Checks:** Verify permissions before starting services
- **Testing:** Test on various Android versions and devices

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run typescript

# Linting
npm run lint
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/paulkiren/react-native-background-task-manager.git
cd react-native-background-task-manager
npm install
npm run validate
```

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- React Native community for inspiration and feedback
- Android developers for comprehensive foreground service documentation
- Contributors who help improve this library

## 📞 Support

- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/paulkiren/react-native-background-task-manager/issues)
- 💬 **Questions:** [GitHub Discussions](https://github.com/paulkiren/react-native-background-task-manager/discussions)  
- 📖 **Documentation:** [API Reference](./docs/API.md)

---

<div align="center">

**[⬆ Back to Top](#-react-native-background-task-manager)**

Made with ❤️ by the React Native community

</div>
