'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, CloudLightning } from 'lucide-react';
import { AddSandboxModal } from '@/components/AddSandboxModal';

interface SandboxSummary {
  id: string;
  name: string;
  status: string;
  _count: { alerts: number };
}

export default function DashboardHome() {
  const [sandboxes, setSandboxes] = useState<SandboxSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpawning, setIsSpawning] = useState(false);

  const fetchSandboxes = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/sandboxes`)
      .then((res) => res.json())
      .then((data) => {
        setSandboxes(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchSandboxes();
  }, []);

  const spawnNewSandbox = async () => {
    setIsSpawning(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/sandboxes/spawn`, {
        method: 'POST'
      });
      
      if (!res.ok) throw new Error("Failed to spawn sandbox.");
      
      await res.json();
      fetchSandboxes(); // Refresh the list to show the new cloud sandbox
    } catch (err) {
      console.error(err);
      alert("Error spawning cloud sandbox. Make sure your E2B API key is set in the backend .env file.");
    } finally {
      setIsSpawning(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Active Sandboxes</h1>
        
        <div className="flex gap-3">
          <button 
            onClick={spawnNewSandbox}
            disabled={isSpawning}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <CloudLightning size={18} /> 
            {isSpawning ? 'Spawning...' : 'Spawn Cloud Sandbox'}
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={18} /> Add Sandbox
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-slate-400">Loading sandboxes...</div>
      ) : sandboxes.length === 0 ? (
        <div className="text-slate-400 p-12 border border-dashed border-slate-800 rounded-xl text-center">
          <p className="mb-4">No active sandboxes found.</p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Monitor an existing ID
            </button>
            <span className="text-slate-600">or</span>
            <button 
              onClick={spawnNewSandbox}
              disabled={isSpawning}
              className="text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
            >
              Spawn a new one
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sandboxes.map((sandbox) => (
            <Link key={sandbox.id} href={`/dashboard/${sandbox.id}`}>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-600 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">{sandbox.name}</h2>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    sandbox.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {sandbox.status}
                  </span>
                </div>
                <p className="text-sm font-mono text-slate-500 mb-4 truncate" title={sandbox.id}>
                  {sandbox.id}
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Active Alerts</span>
                  <span className={`font-medium ${sandbox._count.alerts > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {sandbox._count.alerts}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <AddSandboxModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchSandboxes} 
      />
    </div>
  );
}