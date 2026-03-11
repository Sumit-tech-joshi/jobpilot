'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Application, ApplicationStatus } from '@/types';
import StatusBadge from './StatusBadge';

interface ApplicationTableProps {
  applications: Application[];
  onDelete: (id: string) => void;
  onDownload: (app: Application, type: 'resume' | 'coverletter') => void;
}

const STATUS_OPTIONS: Array<ApplicationStatus | 'all'> = [
  'all', 'saved', 'applied', 'interviewing', 'rejected', 'offer',
];

export default function ApplicationTable({ applications, onDelete, onDownload }: ApplicationTableProps) {
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = applications
    .filter((a) => filter === 'all' || a.status === filter)
    .sort((a, b) => {
      const da = new Date(a.updatedAt).getTime();
      const db = new Date(b.updatedAt).getTime();
      return sortDir === 'desc' ? db - da : da - db;
    });

  function getJob(app: Application) {
    if (typeof app.jobId === 'object' && app.jobId !== null) return app.jobId;
    return null;
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
              filter === s
                ? 'bg-[#1F4E79]/20 text-[#4a9eda] border-[#1F4E79]/40'
                : 'border-[#30363d] text-gray-400 hover:text-white hover:border-[#1F4E79]/30'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
        <button
          onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
          className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium border border-[#30363d] text-gray-400 hover:text-white transition-colors"
        >
          Date {sortDir === 'desc' ? '(newest first)' : '(oldest first)'}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-medium">No applications found</p>
          <p className="text-sm mt-1">
            <Link href="/jobs" className="text-[#4a9eda] hover:underline">
              Find and save jobs
            </Link>{' '}
            to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#30363d] text-gray-500 text-left">
                <th className="pb-3 pr-4 font-medium">Job Title</th>
                <th className="pb-3 pr-4 font-medium">Company</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Updated</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]">
              {filtered.map((app) => {
                const job = getJob(app);
                return (
                  <tr key={app._id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 pr-4">
                      {job ? (
                        <Link
                          href={`/jobs/${encodeURIComponent((job as { jobId?: string }).jobId || String(app.jobId))}`}
                          className="text-white hover:text-[#4a9eda] transition-colors font-medium"
                        >
                          {(job as { title?: string }).title || 'Unknown Job'}
                        </Link>
                      ) : (
                        <span className="text-gray-400">Unknown Job</span>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-gray-400">
                      {job ? (job as { company?: string }).company : '-'}
                    </td>
                    <td className="py-4 pr-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-4 pr-4 text-gray-500">
                      {new Date(app.updatedAt).toLocaleDateString('en-CA', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {job && (
                          <Link
                            href={`/jobs/${encodeURIComponent((job as { jobId?: string }).jobId || String(app.jobId))}`}
                            className="text-xs text-[#4a9eda] hover:underline whitespace-nowrap"
                          >
                            View
                          </Link>
                        )}
                        {app.generatedResume && (
                          <button
                            onClick={() => onDownload(app, 'resume')}
                            className="text-xs text-green-400 hover:underline whitespace-nowrap"
                          >
                            Resume
                          </button>
                        )}
                        {app.generatedCoverLetter && (
                          <button
                            onClick={() => onDownload(app, 'coverletter')}
                            className="text-xs text-green-400 hover:underline whitespace-nowrap"
                          >
                            Cover Letter
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(app._id)}
                          className="text-xs text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
