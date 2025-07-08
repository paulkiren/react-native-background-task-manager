import { AppRegistry } from 'react-native';
import type { TaskConfig, TaskStatus } from './index';

interface Task {
  taskId: string;
  task: Function;
  config: TaskConfig;
  nextExecutionTime: number;
  executionCount: number;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  lastExecutionTime?: number;
  retryAttempts: number;
}

export class TaskManagerClass {
  private readonly tasks: Map<string, Task> = new Map();
  private taskRunner: number | null = null;
  private isRunning: boolean = false;
  private readonly samplingInterval: number = 500; // ms

  /**
   * Generate a unique task ID
   */
  private generateTaskId(): string {
    return "task_" + Math.random().toString(36).substring(2, 14);
  }

  /**
   * Add a new task to the task manager
   */
  addTask(taskFn: Function, config: TaskConfig): string {
    const taskId = config.taskId ?? this.generateTaskId();
    
    const task: Task = {
      taskId,
      task: taskFn,
      config: {
        ...config,
        priority: config.priority ?? 'normal',
        retryCount: config.retryCount ?? 0,
        timeout: config.timeout ?? 30000
      },
      nextExecutionTime: Date.now() + (config.delay ?? 0),
      executionCount: 0,
      status: 'pending',
      retryAttempts: 0
    };

    this.tasks.set(taskId, task);
    this.startTaskRunner();

    return taskId;
  }

  /**
   * Remove a task from the task manager
   */
  removeTask(taskId: string): void {
    this.tasks.delete(taskId);
    
    if (this.tasks.size === 0) {
      this.stopTaskRunner();
    }
  }

  /**
   * Update an existing task
   */
  updateTask(taskId: string, taskFn: Function, config: TaskConfig): void {
    const existingTask = this.tasks.get(taskId);
    if (!existingTask) {
      // If task doesn't exist, add it
      this.addTask(taskFn, { ...config, taskId });
      return;
    }

    const updatedTask: Task = {
      ...existingTask,
      task: taskFn,
      config: {
        ...config,
        priority: config.priority ?? 'normal',
        retryCount: config.retryCount ?? 0,
        timeout: config.timeout ?? 30000
      },
      nextExecutionTime: Date.now() + (config.delay ?? 0),
      status: 'pending'
    };

    this.tasks.set(taskId, updatedTask);
  }

  /**
   * Pause a task
   */
  pauseTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task && task.status !== 'paused') {
      task.status = 'paused';
      this.tasks.set(taskId, task);
    }
  }

  /**
   * Resume a paused task
   */
  resumeTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'paused') {
      task.status = 'pending';
      task.nextExecutionTime = Date.now() + (task.config.delay ?? 0);
      this.tasks.set(taskId, task);
    }
  }

  /**
   * Check if a task is currently running
   */
  isTaskRunning(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    return task ? task.status === 'running' : false;
  }

  /**
   * Get all tasks with their status
   */
  getAllTasks(): Record<string, TaskStatus> {
    const result: Record<string, TaskStatus> = {};
    
    for (const [taskId, task] of this.tasks) {
      result[taskId] = {
        taskId: task.taskId,
        isRunning: task.status === 'running',
        executionCount: task.executionCount,
        ...(task.lastExecutionTime !== undefined && { lastExecutionTime: task.lastExecutionTime }),
        ...(task.nextExecutionTime !== undefined && { nextExecutionTime: task.nextExecutionTime }),
        status: task.status
      };
    }
    
    return result;
  }

  /**
   * Get status of a specific task
   */
  getTaskStatus(taskId: string): TaskStatus | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    return {
      taskId: task.taskId,
      isRunning: task.status === 'running',
      executionCount: task.executionCount,
      ...(task.lastExecutionTime !== undefined && { lastExecutionTime: task.lastExecutionTime }),
      ...(task.nextExecutionTime !== undefined && { nextExecutionTime: task.nextExecutionTime }),
      status: task.status
    };
  }

  /**
   * Remove all tasks
   */
  removeAllTasks(): void {
    this.tasks.clear();
    this.stopTaskRunner();
  }

  /**
   * Start the task runner
   */
  private startTaskRunner(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.taskRunner = setInterval(() => {
      this.executeTasksCycle();
    }, this.samplingInterval) as unknown as number;
  }

  /**
   * Stop the task runner
   */
  private stopTaskRunner(): void {
    if (this.taskRunner) {
      clearInterval(this.taskRunner);
      this.taskRunner = null;
    }
    this.isRunning = false;
  }

  /**
   * Execute tasks that are ready to run
   */
  private async executeTasksCycle(): Promise<void> {
    if (!this.isRunning) return;

    const now = Date.now();
    const readyTasks = Array.from(this.tasks.values())
      .filter(task => this.shouldExecuteTask(task, now))
      .sort((a, b) => this.getTaskPriority(a.config.priority) - this.getTaskPriority(b.config.priority));

    const promises = readyTasks.map(task => this.executeTask(task));
    await Promise.all(promises.map(p => p.catch(e => console.error('Task execution error:', e))));
  }

  /**
   * Check if a task should be executed
   */
  private shouldExecuteTask(task: Task, now: number): boolean {
    return task.status === 'pending' && now >= task.nextExecutionTime;
  }

  /**
   * Get numeric priority value for sorting
   */
  private getTaskPriority(priority?: string): number {
    switch (priority) {
      case 'high': return 1;
      case 'normal': return 2;
      case 'low': return 3;
      default: return 2;
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: Task): Promise<void> {
    task.status = 'running';
    task.lastExecutionTime = Date.now();
    task.executionCount++;
    this.tasks.set(task.taskId, task);

    try {
      // Execute task with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Task timeout')), task.config.timeout);
      });

      const taskPromise = Promise.resolve(task.task());
      await Promise.race([taskPromise, timeoutPromise]);

      // Task succeeded
      task.status = task.config.onLoop ? 'pending' : 'completed';
      
      if (task.config.onLoop) {
        task.nextExecutionTime = Date.now() + task.config.delay;
      } else {
        // Remove one-time task after completion
        this.tasks.delete(task.taskId);
      }

      // Call success callback
      if (task.config.onSuccess) {
        task.config.onSuccess();
      }

    } catch (error) {
      // Task failed
      task.retryAttempts++;
      
      if (task.retryAttempts <= (task.config.retryCount ?? 0)) {
        // Retry the task
        task.status = 'pending';
        task.nextExecutionTime = Date.now() + task.config.delay;
      } else {
        // Max retries reached
        task.status = 'failed';
        
        // Call error callback
        if (task.config.onError) {
          task.config.onError(error as Error);
        }
      }
    }

    this.tasks.set(task.taskId, task);
  }

  /**
   * Register a headless task for background execution
   */
  registerForegroundTask(taskName: string, task: (taskData: any) => Promise<void>): void {
    AppRegistry.registerHeadlessTask(taskName, () => task);
  }

  /**
   * Get task manager statistics
   */
  getStats(): {
    totalTasks: number;
    runningTasks: number;
    pendingTasks: number;
    completedTasks: number;
    failedTasks: number;
  } {
    const tasks = Array.from(this.tasks.values());
    
    return {
      totalTasks: tasks.length,
      runningTasks: tasks.filter(t => t.status === 'running').length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      failedTasks: tasks.filter(t => t.status === 'failed').length
    };
  }
}

// Export singleton instance
export const TaskManager = new TaskManagerClass();
