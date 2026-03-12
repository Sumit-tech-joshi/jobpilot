'use client';

import { useState } from 'react';
import { Job, GeneratedResume, ApplicationStatus } from '@/types';
import ResumePreview from './ResumePreview';
import CoverLetterPreview from './CoverLetterPreview';

interface GeneratePanelProps {
  job: Job;
}

type Tab = 'resume' | 'coverletter';

export default function GeneratePanel({ job }: GeneratePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('resume');
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const [loadingCover, setLoadingCover] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState<string | null>(null);
  const [status, setStatus] = useState<ApplicationStatus>('saved');
  const [notes, setNotes] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerateResume() {
    setLoadingResume(true);
    setError(null);
    try {
      const res = await fetch('/api/generate/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.jobId,
          jobTitle: job.title,
          jobDescription: job.description,
          companyName: job.company,
        }),
      });
      if (!res.ok) throw new Error('Resume generation failed');
      const data = await res.json();
      setResume(data.resume);
      setActiveTab('resume');
    } catch {
      setError('Failed to generate resume. Please try again.');
    } finally {
      setLoadingResume(false);
    }
  }

  async function handleGenerateCoverLetter() {
    setLoadingCover(true);
    setError(null);
    try {
      const res = await fetch('/api/generate/coverletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.jobId,
          jobTitle: job.title,
          jobDescription: job.description,
          companyName: job.company,
        }),
      });
      if (!res.ok) throw new Error('Cover letter generation failed');
      const data = await res.json();
      setCoverLetter(data.coverLetter);
      setActiveTab('coverletter');
    } catch {
      setError('Failed to generate cover letter. Please try again.');
    } finally {
      setLoadingCover(false);
    }
  }

  async function handleDownload(type: 'resume' | 'coverletter', format: 'docx' | 'pdf') {
    const content = type === 'resume' ? JSON.stringify(resume) : coverLetter;
    if (!content) return;

    const key = `${type}-${format}`;
    setLoadingDownload(key);
    try {
      const res = await fetch('/api/generate/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, format, content, jobTitle: job.title, companyName: job.company }),
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = job.company.replace(/\s+/g, '_');
      a.download = type === 'resume'
        ? `Sumit_Joshi_Resume_${safeName}.${format}`
        : `Sumit_Joshi_CoverLetter_${safeName}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Download failed. Please try again.');
    } finally {
      setLoadingDownload(null);
    }
  }

  async function handleSaveStatus() {
    try {
      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.jobId,
          status,
          notes,
          appliedDate: status === 'applied' ? new Date().toISOString() : undefined,
        }),
      });
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2000);
    } catch {
      setError('Failed to save status.');
    }
  }

  return (
    <div className="space-y-5">
      {/* Generate Buttons */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Generate with AI</h2>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGenerateResume}
            disabled={loadingResume}
            className="w-full bg-[#1F4E79] hover:bg-[#2563a0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loadingResume ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating Resume...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {resume ? 'Regenerate Resume' : 'Generate Resume'}
              </>
            )}
          </button>

          <button
            onClick={handleGenerateCoverLetter}
            disabled={loadingCover}
            className="w-full bg-[#1F4E79]/20 hover:bg-[#1F4E79]/40 disabled:opacity-50 disabled:cursor-not-allowed text-[#4a9eda] border border-[#1F4E79]/40 font-medium py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loadingCover ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating Cover Letter...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {coverLetter ? 'Regenerate Cover Letter' : 'Generate Cover Letter'}
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-red-400 text-xs">{error}</p>
        )}
      </div>

      {/* Status + Notes */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Application Status</h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
          className="w-full bg-[#0d1117] border border-[#30363d] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F4E79] mb-3"
        >
          <option value="saved">Saved</option>
          <option value="applied">Applied</option>
          <option value="interviewing">Interviewing</option>
          <option value="rejected">Rejected</option>
          <option value="offer">Offer</option>
        </select>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)..."
          rows={3}
          className="w-full bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F4E79] resize-none mb-3"
        />
        <button
          onClick={handleSaveStatus}
          className="w-full bg-[#30363d] hover:bg-[#3d444d] text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
        >
          {savedStatus ? 'Saved!' : 'Save Status'}
        </button>
      </div>

      {/* Preview Area */}
      {(resume || coverLetter) && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
          {/* Tab switcher */}
          <div className="flex gap-2 mb-4">
            {resume && (
              <button
                onClick={() => setActiveTab('resume')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'resume'
                    ? 'bg-[#1F4E79]/20 text-[#4a9eda] border border-[#1F4E79]/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Resume
              </button>
            )}
            {coverLetter && (
              <button
                onClick={() => setActiveTab('coverletter')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'coverletter'
                    ? 'bg-[#1F4E79]/20 text-[#4a9eda] border border-[#1F4E79]/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Cover Letter
              </button>
            )}
          </div>

          {activeTab === 'resume' && resume && (
            <>
              <ResumePreview resume={resume} />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleDownload('resume', 'pdf')}
                  disabled={loadingDownload !== null}
                  className="flex-1 bg-green-700/20 hover:bg-green-700/40 text-green-400 border border-green-700/40 font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {loadingDownload === 'resume-pdf' ? 'Preparing...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => handleDownload('resume', 'docx')}
                  disabled={loadingDownload !== null}
                  className="flex-1 bg-[#1F4E79]/20 hover:bg-[#1F4E79]/40 text-[#4a9eda] border border-[#1F4E79]/40 font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {loadingDownload === 'resume-docx' ? 'Preparing...' : 'Download DOCX'}
                </button>
              </div>
            </>
          )}

          {activeTab === 'coverletter' && coverLetter && (
            <>
              <CoverLetterPreview text={coverLetter} />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleDownload('coverletter', 'pdf')}
                  disabled={loadingDownload !== null}
                  className="flex-1 bg-green-700/20 hover:bg-green-700/40 text-green-400 border border-green-700/40 font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {loadingDownload === 'coverletter-pdf' ? 'Preparing...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => handleDownload('coverletter', 'docx')}
                  disabled={loadingDownload !== null}
                  className="flex-1 bg-[#1F4E79]/20 hover:bg-[#1F4E79]/40 text-[#4a9eda] border border-[#1F4E79]/40 font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {loadingDownload === 'coverletter-docx' ? 'Preparing...' : 'Download DOCX'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
