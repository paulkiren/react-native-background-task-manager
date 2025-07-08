// jest.setup.js

// Mock react-native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  return {
    ...RN,
    Platform: {
      OS: 'android',
      Version: 34,
      select: jest.fn((platforms) => platforms.default || platforms.android || ''),
    },
    NativeModules: {
      ...RN.NativeModules,
      RNForegroundService: {
        startService: jest.fn(() => Promise.resolve()),
        stopService: jest.fn(() => Promise.resolve()),
        stopServiceAll: jest.fn(() => Promise.resolve()),
        updateService: jest.fn(() => Promise.resolve()),
        isServiceRunning: jest.fn(() => Promise.resolve(false)),
        getServiceCount: jest.fn(() => Promise.resolve(0)),
        checkPermission: jest.fn(() => Promise.resolve(true)),
        requestPermission: jest.fn(() => Promise.resolve(true)),
        checkNotificationPermission: jest.fn(() => Promise.resolve(true)),
        checkBatteryOptimization: jest.fn(() => Promise.resolve(true)),
        getServiceStatus: jest.fn(() => Promise.resolve({ isRunning: false })),
        getServiceMetrics: jest.fn(() => Promise.resolve({
          uptime: 0,
          tasksExecuted: 0,
          tasksSucceeded: 0,
          tasksFailed: 0,
          memoryUsage: 0,
          batteryImpact: 'low'
        })),
        requestBatteryOptimizationExemption: jest.fn(() => Promise.resolve(true)),
        registerForegroundTask: jest.fn(),
        runTask: jest.fn(() => Promise.resolve()),
        cancelNotification: jest.fn(() => Promise.resolve()),
      },
    },
  };
});

// Silence console.warn during tests
global.console.warn = jest.fn();
