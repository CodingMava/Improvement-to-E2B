import { Sandbox } from '@e2b/sdk';
import { TelemetryProvider, SystemMetrics, FileSystemEvent } from './TelemetryProvider';

export class E2BTelemetryProvider implements TelemetryProvider {
  async getMetrics(sandboxId: string): Promise<SystemMetrics> {
    try {
      const sandbox = await Sandbox.connect(sandboxId);
      
      // Updated to use sandbox.commands.run() for E2B SDK v1+
      const cpuResult = await sandbox.commands.run("top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1}'");
      const cpuUsage = parseFloat(cpuResult.stdout as string || '0');

      const memResult = await sandbox.commands.run("free -m | awk 'NR==2{printf \"%.2f\", $3*100/$2 }'");
      const memoryUsage = parseFloat(memResult.stdout as string || '0');

      const diskResult = await sandbox.commands.run("df -h / | awk 'NR==2{print $5}' | sed 's/%//'");
      const diskUsage = parseFloat(diskResult.stdout as string || '0');

      return {
        cpuUsage: isNaN(cpuUsage) ? 0 : cpuUsage,
        memoryUsage: isNaN(memoryUsage) ? 0 : memoryUsage,
        diskUsage: isNaN(diskUsage) ? 0 : diskUsage,
        status: 'active'
      };
    } catch (error) {
      console.error(`Failed to get metrics for ${sandboxId}:`, error);
      return { cpuUsage: 0, memoryUsage: 0, diskUsage: 0, status: 'offline' };
    }
  }

  async getRecentFileEvents(sandboxId: string, since: Date): Promise<FileSystemEvent[]> {
    try {
      const sandbox = await Sandbox.connect(sandboxId);
      const minutesAgo = Math.max(1, Math.floor((Date.now() - since.getTime()) / 60000));
      
      // Updated to use sandbox.commands.run()
      const fileResult = await sandbox.commands.run(`find /home/user -type f -mmin -${minutesAgo}`);
      
      const stdoutStr = (fileResult.stdout as string) || '';
      const files = stdoutStr.split('\n').filter(Boolean);
      
      return files.map((file: string) => ({
        type: 'modified',
        path: file,
        timestamp: new Date()
      }));
    } catch (error) {
      return [];
    }
  }
}