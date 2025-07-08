import { NativeModules, Platform, PermissionsAndroid, NativeEventEmitter } from 'react-native';
import type { 
  ForegroundServiceOptions, 
  ForegroundServiceModule, 
  ForegroundServiceEventListener,
  ServiceMetrics,
  TaskManagerInterface
} from './index';

const LINKING_ERROR =
  `The package 'react-native-foreground-service' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'cd ios && pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const RNForegroundService = NativeModules.RNForegroundService ?? new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

class ForegroundServiceClass implements ForegroundServiceModule {
  private readonly eventEmitter: NativeEventEmitter | null = null;
  private eventListener: ForegroundServiceEventListener | null = null;

  constructor() {
    if (Platform.OS === 'android' && RNForegroundService) {
      this.eventEmitter = new NativeEventEmitter(RNForegroundService);
    }
  }

  /**
   * Start the foreground service with enhanced validation
   */
  async startService(options: ForegroundServiceOptions): Promise<void> {
    if (Platform.OS !== 'android') {
      console.warn('Foreground service is only supported on Android');
      return;
    }

    // Validate required fields
    if (!options.taskName || !options.taskTitle) {
      throw new Error('taskName and taskTitle are required fields');
    }

    // Validate service type for Android 14+
    if (Platform.Version >= 34 && !options.serviceType) {
      throw new Error('serviceType is required for Android 14+ (API level 34)');
    }

    return RNForegroundService.startService(options);
  }

  /**
   * Stop the foreground service
   */
  async stopService(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }
    
    return RNForegroundService.stopService();
  }

  /**
   * Stop all service instances (force stop)
   */
  async stopServiceAll(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }
    
    return RNForegroundService.stopServiceAll();
  }

  /**
   * Update the foreground service notification
   */
  async updateService(options: Partial<ForegroundServiceOptions>): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }
    
    return RNForegroundService.updateService(options);
  }

  /**
   * Check if the service is running
   */
  async isServiceRunning(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }
    
    return RNForegroundService.isServiceRunning();
  }

  /**
   * Check if app has foreground service permission
   */
  async checkPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't need explicit permission
    }
    
    return RNForegroundService.checkPermission();
  }

  /**
   * Check notification permission specifically (Android 13+)
   */
  async checkNotificationPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't need explicit permission check here
    }
    
    return RNForegroundService.checkNotificationPermission();
  }

  /**
   * Check if app is exempted from battery optimization
   */
  async checkBatteryOptimization(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't have battery optimization settings
    }
    
    return RNForegroundService.checkBatteryOptimization();
  }

  /**
   * Request foreground service permission
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't need explicit permission
    }
    
    return RNForegroundService.requestPermission();
  }

  /**
   * Request notification permission (Android 13+)
   * Note: This should be called from React Native side using PermissionsAndroid
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    
    if (Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          'android.permission.POST_NOTIFICATIONS'
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    
    return true; // Permission not needed on older versions
  }

  /**
   * Get service instance count
   */
  async getServiceCount(): Promise<number> {
    if (Platform.OS !== 'android') {
      return 0;
    }
    
    return RNForegroundService.getServiceCount();
  }

  /**
   * Register event listeners for service events
   */
  addEventListener(listener: ForegroundServiceEventListener): void {
    this.eventListener = listener;
    
    if (!this.eventEmitter || Platform.OS !== 'android') {
      return;
    }

    const eventMap = [
      { event: 'onServiceStart', callback: listener.onServiceStart },
      { event: 'onServiceStop', callback: listener.onServiceStop },
      { event: 'onServiceError', callback: listener.onServiceError },
      { event: 'onButtonPress', callback: listener.onButtonPress },
      { event: 'onActionPress', callback: listener.onActionPress },
      { event: 'onTaskComplete', callback: listener.onTaskComplete }
    ];

    eventMap.forEach(({ event, callback }) => {
      if (callback) {
        this.eventEmitter!.addListener(event, callback);
      }
    });

    // Handle onTaskError separately due to multiple parameters
    if (listener.onTaskError) {
      this.eventEmitter.addListener('onTaskError', (event: { taskId: string; error: string }) => {
        listener.onTaskError!(event.taskId, event.error);
      });
    }
  }

  /**
   * Remove event listeners
   */
  removeEventListener(): void {
    if (this.eventEmitter && Platform.OS === 'android') {
      this.eventEmitter.removeAllListeners('onServiceStart');
      this.eventEmitter.removeAllListeners('onServiceStop');
      this.eventEmitter.removeAllListeners('onServiceError');
      this.eventEmitter.removeAllListeners('onButtonPress');
      this.eventEmitter.removeAllListeners('onActionPress');
      this.eventEmitter.removeAllListeners('onTaskComplete');
      this.eventEmitter.removeAllListeners('onTaskError');
    }
    this.eventListener = null;
  }

  /**
   * Get current service status with detailed information
   */
  async getServiceStatus(): Promise<{
    isRunning: boolean;
    startTime?: number;
    serviceType?: string;
    notificationId?: number;
    uptime?: number;
    taskCount?: number;
  }> {
    if (Platform.OS !== 'android') {
      return { isRunning: false };
    }
    
    return RNForegroundService.getServiceStatus();
  }

  /**
   * Get service performance metrics
   */
  async getServiceMetrics(): Promise<ServiceMetrics> {
    if (Platform.OS !== 'android') {
      return {
        uptime: 0,
        tasksExecuted: 0,
        tasksSucceeded: 0,
        tasksFailed: 0,
        memoryUsage: 0,
        batteryImpact: 'low'
      };
    }
    
    return RNForegroundService.getServiceMetrics();
  }

  /**
   * Request battery optimization exemption (required for long-running services)
   */
  async requestBatteryOptimizationExemption(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    
    return RNForegroundService.requestBatteryOptimizationExemption();
  }

  /**
   * Register a foreground task (headless task support)
   */
  registerForegroundTask(taskName: string, task: Function): void {
    if (Platform.OS !== 'android') {
      return;
    }
    
    RNForegroundService.registerForegroundTask(taskName, task);
  }

  /**
   * Run a registered task
   */
  async runTask(taskConfig: { taskName: string; delay?: number; loopDelay?: number; onLoop?: boolean }): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }
    
    return RNForegroundService.runTask(taskConfig);
  }

  /**
   * Cancel a specific notification
   */
  async cancelNotification(notificationId: number): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }
    
    return RNForegroundService.cancelNotification(notificationId);
  }

  /**
   * Task Manager - Advanced task management
   */
  get TaskManager(): TaskManagerInterface {
    // Import TaskManager here to avoid circular dependency
    const { TaskManager } = require('./TaskManager');
    return TaskManager;
  }
}

const ForegroundService = new ForegroundServiceClass();

export default ForegroundService;
export * from './index';
