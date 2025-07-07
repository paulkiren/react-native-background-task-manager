import ForegroundService from '../src/ForegroundService';
import { Platform } from 'react-native';

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    Version: 34,
  },
  NativeModules: {
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
  PermissionsAndroid: {
    request: jest.fn(() => Promise.resolve('granted')),
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
    },
  },
  DeviceEventEmitter: {
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  NativeEventEmitter: jest.fn(() => ({
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
}));

describe('ForegroundService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startService', () => {
    it('should start service with valid options', async () => {
      const options = {
        taskName: 'test-task',
        taskTitle: 'Test Task',
        taskDesc: 'Testing foreground service',
        serviceType: 'dataSync' as const,
      };

      await ForegroundService.startService(options);
      
      expect(require('react-native').NativeModules.RNForegroundService.startService)
        .toHaveBeenCalledWith(expect.objectContaining({
          ...options,
          timeoutMs: 300000, // Default timeout
        }));
    });

    it('should throw error when required fields are missing', async () => {
      const options = {
        taskDesc: 'Testing foreground service',
      } as any;

      await expect(ForegroundService.startService(options))
        .rejects.toThrow('taskName and taskTitle are required fields');
    });

    it('should throw error when serviceType is missing on Android 14+', async () => {
      const options = {
        taskName: 'test-task',
        taskTitle: 'Test Task',
        taskDesc: 'Testing foreground service',
      };

      await expect(ForegroundService.startService(options))
        .rejects.toThrow('serviceType is required for Android 14+');
    });

    it('should handle iOS gracefully', async () => {
      (Platform as any).OS = 'ios';
      
      const options = {
        taskName: 'test-task',
        taskTitle: 'Test Task',
        taskDesc: 'Testing foreground service',
        serviceType: 'dataSync' as const,
      };

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      await ForegroundService.startService(options);
      
      expect(consoleSpy).toHaveBeenCalledWith('Foreground service is only supported on Android');
      consoleSpy.mockRestore();
    });
  });

  describe('permissions', () => {
    it('should check permissions correctly', async () => {
      const result = await ForegroundService.checkPermission();
      expect(result).toBe(true);
    });

    it('should request permissions correctly', async () => {
      const result = await ForegroundService.requestPermission();
      expect(result).toBe(true);
    });

    it('should handle notification permissions on Android 13+', async () => {
      const result = await ForegroundService.requestNotificationPermission();
      expect(result).toBe(true);
    });
  });

  describe('service management', () => {
    it('should stop service correctly', async () => {
      await ForegroundService.stopService();
      expect(require('react-native').NativeModules.RNForegroundService.stopService)
        .toHaveBeenCalled();
    });

    it('should check if service is running', async () => {
      const result = await ForegroundService.isServiceRunning();
      expect(result).toBe(false);
    });

    it('should get service status', async () => {
      const status = await ForegroundService.getServiceStatus();
      expect(status).toEqual({ isRunning: false });
    });
  });
});
