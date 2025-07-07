import { NativeModules, Platform, NativeEventEmitter, AppRegistry } from 'react-native';
import type { ForegroundServiceOptions, ForegroundServiceModule, ForegroundServiceEventListener, ServiceMetrics } from './index';
import { TaskManager } from './TaskManager';

const LINKING_ERROR =
  `The package 'react-native-foreground-service' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'cd ios && pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const RNForegroundService = NativeModules.RNForegroundService ??
  new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );

class ForegroundServiceClass implements ForegroundServiceModule {
  private readonly eventEmitter: NativeEventEmitter | null = null;
  private serviceStartTime: number | null = null;
  private serviceCount: number = 0;
  
  // Task Manager instance
  public TaskManager = TaskManager;

  constructor() {
    if (Platform.OS === 'android' && RNForegroundService) {
      this.eventEmitter = new NativeEventEmitter(RNForegroundService);
    }
  }

  async startService(options: ForegroundServiceOptions): Promise<void> {
    if (Platform.OS !== 'android') {
      console.warn('Foreground service is only supported on Android');
      return;
    }

    if (!options.taskName || !options.taskTitle) {
      throw new Error('taskName and taskTitle are required fields');
    }

    if (Platform.Version >= 34 && !options.serviceType) {
      throw new Error('serviceType is required for Android 14+');
    }

    try {
      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        const granted = await this.requestPermission();
        if (!granted) {
          throw new Error('Foreground service permission denied');
        }
      }

      await RNForegroundService.startService(options);
      this.serviceStartTime = Date.now();
      this.serviceCount++;
      
    } catch (error) {
      throw new Error(`Failed to start foreground service: ${error}`);
    }
  }

  async stopService(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      await RNForegroundService.stopService();
      this.serviceCount = Math.max(0, this.serviceCount - 1);
      
      if (this.serviceCount === 0) {
        this.serviceStartTime = null;
      }
    } catch (error) {
      throw new Error(`Failed to stop foreground service: ${error}`);
    }
  }

  async stopServiceAll(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      await RNForegroundService.stopServiceAll();
      this.serviceCount = 0;
      this.serviceStartTime = null;
    } catch (error) {
      throw new Error(`Failed to stop all foreground services: ${error}`);
    }
  }

  async updateService(options: Partial<ForegroundServiceOptions>): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      await RNForegroundService.updateService(options);
    } catch (error) {
      throw new Error(`Failed to update foreground service: ${error}`);
    }
  }

  async isServiceRunning(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      return await RNForegroundService.isServiceRunning();
    } catch (error) {
      console.error('Error checking service status:', error);
      return false;
    }
  }

  async getServiceCount(): Promise<number> {
    if (Platform.OS !== 'android') {
      return 0;
    }
    
    try {
      return await RNForegroundService.getServiceCount() ?? this.serviceCount;
    } catch (error) {
      console.error('Error getting service count:', error);
      return this.serviceCount;
    }
  }

  async checkPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    
    try {
      return await RNForegroundService.checkPermission();
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    
    try {
      return await RNForegroundService.requestPermission();
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  async checkNotificationPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    
    try {
      return await RNForegroundService.checkNotificationPermission();
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return false;
    }
  }

  async checkBatteryOptimization(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    
    try {
      return await RNForegroundService.checkBatteryOptimization();
    } catch (error) {
      console.error('Error checking battery optimization:', error);
      return false;
    }
  }

  async requestBatteryOptimizationExemption(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    
    try {
      return await RNForegroundService.requestBatteryOptimizationExemption();
    } catch (error) {
      console.error('Error requesting battery optimization exemption:', error);
      return false;
    }
  }

  addEventListener(listener: ForegroundServiceEventListener): void {
    if (Platform.OS !== 'android' || !this.eventEmitter) {
      return;
    }
    
    this.eventEmitter.addListener('onServiceStart', () => {
      listener.onServiceStart?.();
    });

    this.eventEmitter.addListener('onServiceStop', () => {
      listener.onServiceStop?.();
    });

    this.eventEmitter.addListener('onServiceError', (error: string) => {
      listener.onServiceError?.(error);
    });

    this.eventEmitter.addListener('onButtonPress', (action: string) => {
      listener.onButtonPress?.(action);
    });

    this.eventEmitter.addListener('onActionPress', (actionId: string) => {
      listener.onActionPress?.(actionId);
    });
  }

  removeEventListener(): void {
    if (Platform.OS !== 'android' || !this.eventEmitter) {
      return;
    }

    this.eventEmitter.removeAllListeners('onServiceStart');
    this.eventEmitter.removeAllListeners('onServiceStop');
    this.eventEmitter.removeAllListeners('onServiceError');
    this.eventEmitter.removeAllListeners('onButtonPress');
    this.eventEmitter.removeAllListeners('onActionPress');
  }

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

    try {
      const isRunning = await this.isServiceRunning();
      const taskStats = this.TaskManager.getStats();
      
      return {
        isRunning,
        startTime: this.serviceStartTime ?? undefined,
        uptime: this.serviceStartTime ? Date.now() - this.serviceStartTime : undefined,
        taskCount: taskStats.totalTasks,
        notificationId: 1,
      };
    } catch (error) {
      console.error('Error getting service status:', error);
      return { isRunning: false };
    }
  }

  async getServiceMetrics(): Promise<ServiceMetrics> {
    const taskStats = this.TaskManager.getStats();
    
    return {
      uptime: this.serviceStartTime ? Date.now() - this.serviceStartTime : 0,
      tasksExecuted: taskStats.totalTasks,
      tasksSucceeded: taskStats.completedTasks,
      tasksFailed: taskStats.failedTasks,
      memoryUsage: 0,
      batteryImpact: 'low',
    };
  }

  registerForegroundTask(taskName: string, task: Function): void {
    AppRegistry.registerHeadlessTask(taskName, () => task);
  }

  async runTask(taskConfig: { taskName: string; delay?: number; loopDelay?: number; onLoop?: boolean }): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      await RNForegroundService.runTask(taskConfig);
    } catch (error) {
      throw new Error(`Failed to run task: ${error}`);
    }
  }

  async cancelNotification(notificationId: number): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      await RNForegroundService.cancelNotification(notificationId);
    } catch (error) {
      throw new Error(`Failed to cancel notification: ${error}`);
    }
  }
}

const ForegroundService = new ForegroundServiceClass();

export default ForegroundService;
export * from './index';
