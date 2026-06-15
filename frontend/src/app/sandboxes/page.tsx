'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, ExternalLink } from 'lucide-react';

export default function SandboxesPage() {
  const [sandboxes, setSandboxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSandboxes = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/sandboxes`)
      .then((res) => res.json())
      .then((data) => {
        setSandboxes(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSandboxes();
  }, []);

  const deleteSandbox = async (id: string) => {
    if (!confirm('Are you sure you want to stop monitoring this sandbox?')) return;
    
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/sandboxes/${id}`, {
      method: 'DELETE',
    });
    fetchSandboxes(); // Refresh the list
  };

  if (loading) return <div className="p-8 text-white">Loading sandboxes...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Manage Sandboxes</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-300">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Sandbox ID</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sandboxes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center border-b border-slate-800">
                  No sandboxes registered.
                </td>
              </tr>
            ) : (
              sandboxes.map((sandbox) => (
                <tr key={sandbox.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{sandbox.name}</td>
                  <td className="px-6 py-4 font-mono text-xs">{sandbox.id}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      sandbox.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {sandbox.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <Link href={`/dashboard/${sandbox.id}`} className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                      <ExternalLink size={16} /> View
                    </Link>
                    <button 
                      onClick={() => deleteSandbox(sandbox.id)}
                      className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 ml-4"
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}