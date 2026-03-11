'use client';

import { useState, useEffect } from 'react';
import { Application } from '@/types';
import ApplicationTable from '@/components/applications/ApplicationTable';
import Link from 'next/link';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadApplications() {
    try {
      setLoading(true);
      const res = await fetch('/api/applications');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setApplications(data.applications || []);
    } catch {
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this application?')) return;
    try {
      await fetch(`/api/applications?id=${id}`, { method: 'DELETE' });
      setApplications((prev) => prev.filter((a) => a._id !== id));
    } catch {
      alert('Failed to delete.');
    }
  }

  async function handleDownload(app: Application, type: 'resume' | 'coverletter') {
    const content = type === 'resume' ? app.generatedResume : app.generatedCoverLetter;
    if (!content) return;

    const job = app.jobId as { title?: string; company?: string } | null;
    const jobTitle = job?.title || 'Job';
    const companyName = job?.company || 'Company';

    try {
      const res = await fetch('/api/generate/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content, jobTitle, companyName }),
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        type === 'resume'
          ? `Sumit_Joshi_Resume_${companyName.replace(/\s+/g, '_')}.docx`
          : `Sumit_Joshi_CoverLetter_${companyName.replace(/\s+/g, '_')}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Download failed. Please try again.');
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">My Applications</h1>
          <p className="text-gray-500 text-sm">Track all your job applications in one place</p>
        </div>
        <Link
          href="/jobs"
          className="bg-[#1F4E79] hover:bg-[#2563a0] text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          Find More Jobs
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#161b22] border border-[#30363d] rounded-xl h-14 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      ) : (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
          <ApplicationTable
            applications={applications}
            onDelete={handleDelete}
            onDownload={handleDownload}
          />
        </div>
      )}
    </div>
  );
}
