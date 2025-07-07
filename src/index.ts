// Enhanced notification action interface
export interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
  actionType?: 'foreground' | 'background';
}

// Enhanced task configuration interface
export interface TaskConfig {
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

// Task status interface
export interface TaskStatus {
  taskId: string;
  isRunning: boolean;
  executionCount: number;
  lastExecutionTime?: number;
  nextExecutionTime?: number;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
}

// Service metrics interface
export interface ServiceMetrics {
  uptime: number;
  tasksExecuted: number;
  tasksSucceeded: number;
  tasksFailed: number;
  memoryUsage: number;
  batteryImpact: 'low' | 'medium' | 'high';
}

export interface ForegroundServiceOptions {
  taskName: string;
  taskTitle: string;
  taskDesc: string;
  taskIcon?: string;
  importance?: 'NONE' | 'MIN' | 'LOW' | 'DEFAULT' | 'HIGH';
  number?: number;
  button?: boolean;
  buttonText?: string;
  buttonOnPress?: string;
  // Enhanced multiple button support
  button2?: boolean;
  button2Text?: string;
  button2OnPress?: string;
  button3?: boolean;
  button3Text?: string;
  button3OnPress?: string;
  // Enhanced notification options
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
  // New Android 14+ fields
  foregroundServiceType?: string;
  autoStop?: boolean; // Auto-stop service after task completion
  timeoutMs?: number; // Service timeout for safety
}

// Enhanced service event listener interface
export interface ForegroundServiceEventListener {
  onServiceStart?: () => void;
  onServiceStop?: () => void;
  onServiceError?: (error: string) => void;
  onButtonPress?: (action: string) => void;
  onActionPress?: (actionId: string) => void;
  onTaskComplete?: (taskId: string) => void;
  onTaskError?: (taskId: string, error: string) => void;
}

// Task manager interface
export interface TaskManagerInterface {
  addTask(task: Function, config: TaskConfig): string;
  removeTask(taskId: string): void;
  updateTask(taskId: string, task: Function, config: TaskConfig): void;
  pauseTask(taskId: string): void;
  resumeTask(taskId: string): void;
  isTaskRunning(taskId: string): boolean;
  getAllTasks(): Record<string, TaskStatus>;
  getTaskStatus(taskId: string): TaskStatus | null;
  removeAllTasks(): void;
}

export interface ForegroundServiceModule {
  /**
   * Start the foreground service
   */
  startService(options: ForegroundServiceOptions): Promise<void>;
  
  /**
   * Stop the foreground service
   */
  stopService(): Promise<void>;
  
  /**
   * Stop all service instances (force stop)
   */
  stopServiceAll(): Promise<void>;
  
  /**
   * Update the foreground service notification
   */
  updateService(options: Partial<ForegroundServiceOptions>): Promise<void>;
  
  /**
   * Check if the service is running
   */
  isServiceRunning(): Promise<boolean>;
  
  /**
   * Get service instance count
   */
  getServiceCount(): Promise<number>;
  
  /**
   * Check if app has all required permissions (foreground service + notifications)
   */
  checkPermission(): Promise<boolean>;
  
  /**
   * Request foreground service permission
   */
  requestPermission(): Promise<boolean>;
  
  /**
   * Check notification permission specifically (Android 13+)
   */
  checkNotificationPermission(): Promise<boolean>;
  
  /**
   * Check if app is exempted from battery optimization
   */
  checkBatteryOptimization(): Promise<boolean>;
  
  /**
   * Register event listeners for service events
   */
  addEventListener(listener: ForegroundServiceEventListener): void;
  
  /**
   * Remove event listeners
   */
  removeEventListener(): void;
  
  /**
   * Get current service status with detailed information
   */
  getServiceStatus(): Promise<{
    isRunning: boolean;
    startTime?: number;
    serviceType?: string;
    notificationId?: number;
    uptime?: number;
    taskCount?: number;
  }>;
  
  /**
   * Get service performance metrics
   */
  getServiceMetrics(): Promise<ServiceMetrics>;
  
  /**
   * Request battery optimization exemption (required for long-running services)
   */
  requestBatteryOptimizationExemption(): Promise<boolean>;
  
  /**
   * Register a foreground task (headless task support)
   */
  registerForegroundTask(taskName: string, task: Function): void;
  
  /**
   * Run a registered task
   */
  runTask(taskConfig: { taskName: string; delay?: number; loopDelay?: number; onLoop?: boolean }): Promise<void>;
  
  /**
   * Cancel a specific notification
   */
  cancelNotification(notificationId: number): Promise<void>;
  
  /**
   * Task Manager - Advanced task management
   */
  TaskManager: TaskManagerInterface;
}

export { default } from './ForegroundService';
export { TaskManager } from './TaskManager';
