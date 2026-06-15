'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTelemetrySocket } from '@/hooks/useTelemetrySocket';
import { format } from 'date-fns';

export default function SandboxDetail({ params }: { params: { id: string } }) {
  const { telemetry, fileEvents } = useTelemetrySocket(params.id);
  const [sandbox, setSandbox] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/sandboxes/${params.id}`)
      .then(res => res.json())
      .then(data => setSandbox(data));
  }, [params.id]);

  if (!sandbox) return <div className="p-8 text-white">Loading Sandbox Data...</div>;

  const currentMetrics = telemetry[telemetry.length - 1] || { cpuUsage: 0, memoryUsage: 0 };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{sandbox.name}</h1>
        <p className="text-slate-400 font-mono text-sm">ID: {sandbox.id} • Status: {currentMetrics.status}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-sm text-slate-400 mb-2">Current CPU</h3>
          <p className="text-4xl font-semibold text-emerald-400">{currentMetrics.cpuUsage.toFixed(1)}%</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-sm text-slate-400 mb-2">Current Memory</h3>
          <p className="text-4xl font-semibold text-blue-400">{currentMetrics.memoryUsage.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl h-96">
            <h2 className="text-xl font-semibold mb-4">CPU Usage (Live)</h2>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetry}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" tickFormatter={(t) => format(new Date(t), 'HH:mm:ss')} stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                <Line type="monotone" dataKey="cpuUsage" stroke="#34d399" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Filesystem Activity</h2>
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
            {fileEvents.length === 0 ? (
              <p className="text-slate-500 text-sm">No recent activity detected.</p>
            ) : (
              fileEvents.map((event, idx) => (
                <div key={idx} className="flex flex-col border-l-2 border-slate-700 pl-4 py-1">
                  <span className="text-xs text-slate-500 font-mono">
                    {format(new Date(event.timestamp), 'HH:mm:ss')}
                  </span>
                  <span className="text-sm">
                    <span className={`font-semibold ${event.type === 'deleted' ? 'text-rose-400' : 'text-sky-400'}`}>
                      {event.type}
                    </span>{' '}
                    <span className="font-mono text-slate-300">{event.path.split('/').pop()}</span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}