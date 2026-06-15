'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface Alert {
  id: string;
  sandboxId: string;
  severity: 'WARNING' | 'CRITICAL';
  message: string;
  dismissed: boolean;
  timestamp: string;
  sandbox: { name: string };
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/alerts`)
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchAlerts();
    // Poll for new alerts every 10 seconds
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const dismissAlert = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/alerts/${id}/dismiss`, {
      method: 'PATCH',
    });
    fetchAlerts(); // Refresh list
  };

  if (loading) return <div className="p-8 text-white">Loading alerts...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Alert Center</h1>

      {alerts.length === 0 ? (
        <div className="text-slate-400 p-8 border border-dashed border-slate-800 rounded-xl text-center">
          <CheckCircle className="mx-auto mb-4 text-emerald-500" size={32} />
          All clear! No alerts have been detected.
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`flex items-start justify-between p-4 rounded-xl border ${
                alert.dismissed 
                  ? 'bg-slate-900/50 border-slate-800 opacity-60' 
                  : alert.severity === 'CRITICAL' 
                    ? 'bg-rose-500/10 border-rose-500/20' 
                    : 'bg-amber-500/10 border-amber-500/20'
              }`}
            >
              <div className="flex gap-4 items-start">
                {alert.severity === 'CRITICAL' ? (
                  <AlertCircle className="text-rose-400 mt-1" size={24} />
                ) : (
                  <AlertTriangle className="text-amber-400 mt-1" size={24} />
                )}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-sm font-mono text-slate-400">
                      {format(new Date(alert.timestamp), 'MMM d, HH:mm:ss')}
                    </span>
                  </div>
                  <h3 className="text-white font-medium mb-1">{alert.sandbox.name}</h3>
                  <p className="text-slate-300 text-sm">{alert.message}</p>
                </div>
              </div>
              
              {!alert.dismissed && (
                <button 
                  onClick={() => dismissAlert(alert.id)}
                  className="text-sm text-slate-400 hover:text-white px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}