import ForegroundService from '../src/ForegroundService';
import { Platform } from 'react-native';

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    Version: 34,
    select: jest.fn((platforms) => platforms.default || platforms.android || ''),
  },
  NativeModules: {
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
  AppRegistry: {
    registerHeadlessTask: jest.fn(),
  },
}));

// Mock TaskManager
jest.mock('../src/TaskManager', () => ({
  TaskManager: {
    getStats: jest.fn(() => ({
      totalTasks: 0,
      runningTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
    })),
    addTask: jest.fn(),
    removeTask: jest.fn(),
    updateTask: jest.fn(),
    pauseTask: jest.fn(),
    resumeTask: jest.fn(),
    isTaskRunning: jest.fn(() => false),
    getAllTasks: jest.fn(() => ({})),
    getTaskStatus: jest.fn(() => null),
    removeAllTasks: jest.fn(),
  },
}));

describe('ForegroundService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear specific mocks
    const RNForegroundService = require('react-native').NativeModules.RNForegroundService;
    Object.values(RNForegroundService).forEach((mockFn: any) => {
      if (typeof mockFn === 'function' && mockFn.mockClear) {
        mockFn.mockClear();
      }
    });
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
        .toHaveBeenCalledWith(options);
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
      // Get a fresh reference to the mock
      const { NativeModules } = require('react-native');
      const mockStopService = NativeModules.RNForegroundService.stopService;
      
      // Ensure Platform.OS is android for this test
      const { Platform } = require('react-native');
      Platform.OS = 'android';
      
      await ForegroundService.stopService();
      
      expect(mockStopService).toHaveBeenCalled();
    });

    it('should check if service is running', async () => {
      const result = await ForegroundService.isServiceRunning();
      expect(result).toBe(false);
    });

    it('should get service status', async () => {
      const status = await ForegroundService.getServiceStatus();
      expect(status).toEqual({ 
        isRunning: false,
        notificationId: 1,
        taskCount: 0
      });
    });
  });

  describe('enhanced features', () => {
    it('should get service metrics', async () => {
      const metrics = await ForegroundService.getServiceMetrics();
      expect(metrics).toEqual({
        uptime: 0,
        tasksExecuted: 0,
        tasksSucceeded: 0,
        tasksFailed: 0,
        memoryUsage: 0,
        batteryImpact: 'low',
      });
    });

    it('should stop all services', async () => {
      const mockStopServiceAll = require('react-native').NativeModules.RNForegroundService.stopServiceAll;
      
      await ForegroundService.stopServiceAll();
      
      expect(mockStopServiceAll).toHaveBeenCalled();
    });

    it('should get service count', async () => {
      const count = await ForegroundService.getServiceCount();
      expect(count).toBe(0);
    });

    it('should check battery optimization', async () => {
      const result = await ForegroundService.checkBatteryOptimization();
      expect(result).toBe(true);
    });

    it('should request battery optimization exemption', async () => {
      const result = await ForegroundService.requestBatteryOptimizationExemption();
      expect(result).toBe(true);
    });

    it('should register foreground task', () => {
      const taskName = 'testTask';
      const task = jest.fn();
      
      ForegroundService.registerForegroundTask(taskName, task);
      
      expect(require('react-native').AppRegistry.registerHeadlessTask)
        .toHaveBeenCalledWith(taskName, expect.any(Function));
    });

    it('should run task', async () => {
      const taskConfig = {
        taskName: 'testTask',
        delay: 1000,
        onLoop: true,
      };
      
      await ForegroundService.runTask(taskConfig);
      
      expect(require('react-native').NativeModules.RNForegroundService.runTask)
        .toHaveBeenCalledWith(taskConfig);
    });

    it('should cancel notification', async () => {
      const notificationId = 123;
      
      await ForegroundService.cancelNotification(notificationId);
      
      expect(require('react-native').NativeModules.RNForegroundService.cancelNotification)
        .toHaveBeenCalledWith(notificationId);
    });

    it('should handle event listeners', () => {
      const listener = {
        onServiceStart: jest.fn(),
        onServiceStop: jest.fn(),
        onServiceError: jest.fn(),
        onButtonPress: jest.fn(),
        onActionPress: jest.fn(),
        onTaskComplete: jest.fn(),
        onTaskError: jest.fn(),
      };
      
      ForegroundService.addEventListener(listener);
      ForegroundService.removeEventListener();
      
      // These would be tested more thoroughly with actual event emission
      expect(true).toBe(true); // Placeholder for event listener tests
    });

    it('should access TaskManager', () => {
      const taskManager = ForegroundService.TaskManager;
      expect(taskManager).toBeDefined();
      expect(typeof taskManager.addTask).toBe('function');
      expect(typeof taskManager.getStats).toBe('function');
    });
  });
});
