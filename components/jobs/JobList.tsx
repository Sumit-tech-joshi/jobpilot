'use client';

import { Job } from '@/types';
import JobCard from './JobCard';

interface JobListProps {
  jobs: Job[];
  loading?: boolean;
  savedJobIds?: Set<string>;
  onSave?: (job: Job) => void;
  page: number;
  onPageChange: (page: number) => void;
  hasMore: boolean;
}

function SkeletonCard() {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 animate-pulse">
      <div className="h-5 bg-[#30363d] rounded w-3/4 mb-2" />
      <div className="h-4 bg-[#30363d] rounded w-1/2 mb-4" />
      <div className="h-3 bg-[#30363d] rounded w-full mb-2" />
      <div className="h-3 bg-[#30363d] rounded w-4/5" />
    </div>
  );
}

export default function JobList({
  jobs,
  loading,
  savedJobIds,
  onSave,
  page,
  onPageChange,
  hasMore,
}: JobListProps) {
  if (loading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!loading && jobs.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-lg font-medium">No jobs found</p>
        <p className="text-sm mt-1">Try different keywords or location</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4">
        {jobs.map((job) => (
          <JobCard
            key={job.jobId}
            job={job}
            onSave={onSave}
            isSaved={savedJobIds?.has(job.jobId)}
          />
        ))}
      </div>

      {(page > 1 || hasMore) && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 text-sm border border-[#30363d] rounded-lg text-gray-400 hover:text-white hover:border-[#1F4E79]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-500 text-sm">Page {page}</span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={!hasMore}
            className="px-4 py-2 text-sm border border-[#30363d] rounded-lg text-gray-400 hover:text-white hover:border-[#1F4E79]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
