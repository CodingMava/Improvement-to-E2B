import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

export function useTelemetrySocket(sandboxId: string) {
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [fileEvents, setFileEvents] = useState<any[]>([]);

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL);

    socket.emit('subscribe_sandbox', sandboxId);

    socket.on('telemetry_update', (data) => {
      setTelemetry((prev) => [...prev.slice(-99), data]); // Keep last 100 points
    });

    socket.on('file_events_update', (events) => {
      setFileEvents((prev) => [...events, ...prev].slice(0, 50)); // Keep latest 50
    });

    return () => {
      socket.emit('unsubscribe_sandbox', sandboxId);
      socket.disconnect();
    };
  }, [sandboxId]);

  return { telemetry, fileEvents };
}