export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  status: 'active' | 'offline' | 'error';
}

export interface FileSystemEvent {
  type: 'created' | 'modified' | 'deleted';
  path: string;
  timestamp: Date;
}

export interface TelemetryProvider {
  getMetrics(sandboxId: string): Promise<SystemMetrics>;
  getRecentFileEvents(sandboxId: string, since: Date): Promise<FileSystemEvent[]>;
}