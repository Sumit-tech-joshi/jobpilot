'use client';

import Link from 'next/link';
import { Job } from '@/types';

interface JobCardProps {
  job: Job;
  onSave?: (job: Job) => void;
  isSaved?: boolean;
}

export default function JobCard({ job, onSave, isSaved }: JobCardProps) {
  const postedDate = job.postedDate
    ? new Date(job.postedDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-[#1F4E79]/50 transition-colors group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link
            href={`/jobs/${encodeURIComponent(job.jobId)}`}
            className="block text-white font-semibold text-base group-hover:text-[#4a9eda] transition-colors truncate"
          >
            {job.title}
          </Link>
          <p className="text-gray-400 text-sm mt-0.5 truncate">{job.company}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${
            job.source === 'adzuna'
              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
              : 'bg-orange-500/10 text-orange-300 border-orange-500/30'
          }`}
        >
          {job.source === 'adzuna' ? 'Adzuna' : 'JSearch'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {job.location}
        </span>
        {job.salary && (
          <span className="flex items-center gap-1 text-green-400/80">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {job.salary}
          </span>
        )}
        {job.jobType && <span className="capitalize">{job.jobType.replace(/_/g, ' ')}</span>}
        {postedDate && <span>{postedDate}</span>}
      </div>

      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {job.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-[#1F4E79]/10 text-[#4a9eda]/70 border border-[#1F4E79]/20 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#30363d]">
        <Link
          href={`/jobs/${encodeURIComponent(job.jobId)}`}
          className="flex-1 text-center text-sm text-[#4a9eda] hover:text-white transition-colors font-medium"
        >
          View Details
        </Link>
        <button
          onClick={() => onSave?.(job)}
          className={`flex-1 text-sm font-medium py-1.5 rounded-lg border transition-colors ${
            isSaved
              ? 'bg-[#1F4E79]/20 text-[#4a9eda] border-[#1F4E79]/40'
              : 'border-[#30363d] text-gray-400 hover:border-[#1F4E79]/40 hover:text-[#4a9eda]'
          }`}
        >
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}
