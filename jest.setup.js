// jest.setup.js
import 'react-native-gesture-handler/jestSetup';

// Mock react-native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  return {
    ...RN,
    NativeModules: {
      ...RN.NativeModules,
      RNForegroundService: {
        startService: jest.fn(() => Promise.resolve()),
        stopService: jest.fn(() => Promise.resolve()),
        updateService: jest.fn(() => Promise.resolve()),
        isServiceRunning: jest.fn(() => Promise.resolve(false)),
        checkPermission: jest.fn(() => Promise.resolve(true)),
        requestPermission: jest.fn(() => Promise.resolve(true)),
        checkNotificationPermission: jest.fn(() => Promise.resolve(true)),
        checkBatteryOptimization: jest.fn(() => Promise.resolve(true)),
        getServiceStatus: jest.fn(() => Promise.resolve({ isRunning: false })),
        requestBatteryOptimizationExemption: jest.fn(() => Promise.resolve(true)),
      },
    },
  };
});

// Silence console.warn during tests
global.console.warn = jest.fn();
