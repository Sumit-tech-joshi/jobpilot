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
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:border-[#6366F1]/30 hover:bg-white/[0.04] transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link
            href={`/jobs/${encodeURIComponent(job.jobId)}`}
            className="block text-white font-semibold text-base group-hover:text-[#8B5CF6] transition-colors truncate"
          >
            {job.title}
          </Link>
          <p className="text-[#94A3B8] text-sm mt-0.5 truncate">{job.company}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${
            job.source === 'adzuna'
              ? 'bg-[#8B5CF6]/10 text-[#A78BFA] border-[#8B5CF6]/30'
              : 'bg-orange-500/10 text-orange-300 border-orange-500/30'
          }`}
        >
          {job.source === 'adzuna' ? 'Adzuna' : 'JSearch'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-[#475569]">
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
              className="text-xs bg-[#6366F1]/10 text-[#818CF8] border border-[#6366F1]/20 px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/[0.05]">
        <Link
          href={`/jobs/${encodeURIComponent(job.jobId)}`}
          className="flex-1 text-center text-sm text-[#8B5CF6] hover:text-[#A78BFA] transition-colors font-medium"
        >
          View Details
        </Link>
        <button
          onClick={() => onSave?.(job)}
          className={`flex-1 text-sm font-medium py-1.5 rounded-xl border transition-all ${
            isSaved
              ? 'bg-[#6366F1]/10 text-[#818CF8] border-[#6366F1]/30'
              : 'border-white/[0.08] text-[#94A3B8] hover:border-[#6366F1]/30 hover:text-[#8B5CF6]'
          }`}
        >
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}
