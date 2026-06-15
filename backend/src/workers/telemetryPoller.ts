import { PrismaClient } from '@prisma/client';
// Ensure we are importing the REAL E2B Provider
import { E2BTelemetryProvider } from '../providers/E2BTelemetryProvider';
import { io } from '../app';

const prisma = new PrismaClient();
// Initialize the REAL provider
const provider = new E2BTelemetryProvider();


export const startPoller = () => {
  setInterval(async () => {
    const sandboxes = await prisma.sandbox.findMany({ where: { status: 'active' } });
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const twoMinutesAgo = new Date(now.getTime() - 120000);

    for (const sandbox of sandboxes) {
      try {
        const metrics = await provider.getMetrics(sandbox.id);
        const fileEvents = await provider.getRecentFileEvents(sandbox.id, new Date(Date.now() - 5000));

        // 1. Store Telemetry
        const telemetryRecord = await prisma.telemetry.create({
          data: {
            sandboxId: sandbox.id,
            cpuUsage: metrics.cpuUsage,
            memoryUsage: metrics.memoryUsage,
            diskUsage: metrics.diskUsage,
            status: metrics.status,
          }
        });

        // 2. Store File Events
        const savedEvents = await Promise.all(
          fileEvents.map(event => prisma.fileEvent.create({
            data: {
              sandboxId: sandbox.id,
              type: event.type,
              path: event.path
            }
          }))
        );

        // 3. Broadcast Real-time Updates
        io.to(`sandbox_${sandbox.id}`).emit('telemetry_update', telemetryRecord);
        if (savedEvents.length > 0) {
          io.to(`sandbox_${sandbox.id}`).emit('file_events_update', savedEvents);
        }

        // 4. Agent Health Detection (Idle)
        const recentTelemetry = await prisma.telemetry.findMany({
          where: { sandboxId: sandbox.id, timestamp: { gte: oneMinuteAgo } }
        });
        
        const recentFiles = await prisma.fileEvent.count({
          where: { sandboxId: sandbox.id, timestamp: { gte: oneMinuteAgo } }
        });

        const isCpuIdle = recentTelemetry.every(t => t.cpuUsage < 5.0);
        if (isCpuIdle && recentFiles === 0 && recentTelemetry.length > 5) {
          await generateAlert(sandbox.id, 'WARNING', 'Agent appears to be idle for 60 seconds.');
        }

        // 5. Infinite Loop Detection
        const twoMinTelemetry = await prisma.telemetry.findMany({
          where: { sandboxId: sandbox.id, timestamp: { gte: twoMinutesAgo } }
        });
        const twoMinFiles = await prisma.fileEvent.count({
          where: { sandboxId: sandbox.id, timestamp: { gte: twoMinutesAgo } }
        });

        const isCpuSpiking = twoMinTelemetry.every(t => t.cpuUsage > 80.0);
        if (isCpuSpiking && twoMinFiles === 0 && twoMinTelemetry.length > 10) {
          await generateAlert(sandbox.id, 'CRITICAL', 'Potential infinite loop detected. High CPU with no I/O for 2 minutes.');
        }

      } catch (err) {
        console.error(`Error polling sandbox ${sandbox.id}:`, err);
      }
    }
  }, 5000); // Poll every 5 seconds
};

async function generateAlert(sandboxId: string, severity: string, message: string) {
  // Prevent alert spamming by checking recent identical alerts
  const recentAlert = await prisma.alert.findFirst({
    where: { sandboxId, message, timestamp: { gte: new Date(Date.now() - 300000) } }
  });

  if (!recentAlert) {
    const alert = await prisma.alert.create({
      data: { sandboxId, severity, message }
    });
    io.emit('new_alert', alert);
  }
}