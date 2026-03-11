'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Job } from '@/types';
import JobSearch from '@/components/jobs/JobSearch';
import JobList from '@/components/jobs/JobList';
import { Suspense } from 'react';

function JobsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [source, setSource] = useState<'both' | 'adzuna' | 'jsearch'>('both');

  const keyword = searchParams.get('keyword') || '';
  const location = searchParams.get('location') || '';

  const fetchJobs = useCallback(
    async (kw: string, loc: string, pg: number, src: string) => {
      if (!kw && !loc) return;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          keyword: kw || 'software developer',
          location: loc || 'Canada',
          page: String(pg),
          source: src,
        });
        const res = await fetch(`/api/jobs?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        setJobs(data.jobs || []);
        setHasMore((data.jobs || []).length >= 10);
      } catch {
        setError('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (keyword || location) {
      fetchJobs(keyword, location, page, source);
    }
  }, [keyword, location, page, source, fetchJobs]);

  function handleSearch(kw: string, loc: string) {
    setPage(1);
    const params = new URLSearchParams({ keyword: kw, location: loc });
    router.push(`/jobs?${params.toString()}`);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave(job: Job) {
    try {
      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.jobId, status: 'saved' }),
      });
      setSavedJobIds((prev) => new Set([...prev, job.jobId]));
    } catch {
      // silently fail
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Find Jobs</h1>
        <p className="text-gray-500 text-sm">Search real listings from Adzuna and JSearch</p>
      </div>

      <div className="mb-6">
        <JobSearch
          onSearch={handleSearch}
          loading={loading}
          initialKeyword={keyword}
          initialLocation={location}
        />
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 sticky top-24">
            <h3 className="text-white font-semibold text-sm mb-4">Filters</h3>

            <div className="mb-4">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">Source</p>
              {(['both', 'adzuna', 'jsearch'] as const).map((s) => (
                <label key={s} className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name="source"
                    value={s}
                    checked={source === s}
                    onChange={() => { setSource(s); setPage(1); }}
                    className="accent-[#1F4E79]"
                  />
                  <span className="text-gray-300 text-sm capitalize">{s}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Job list */}
        <div className="flex-1 min-w-0">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {!keyword && !location && !loading && (
            <div className="text-center py-20 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg font-medium">Search for jobs above</p>
              <p className="text-sm mt-1">Enter a keyword and location to find real listings</p>
            </div>
          )}

          {(keyword || location || loading) && (
            <>
              {!loading && jobs.length > 0 && (
                <p className="text-gray-500 text-sm mb-4">
                  Found <span className="text-white font-medium">{jobs.length}</span> jobs
                  {keyword && <> for <span className="text-white font-medium">"{keyword}"</span></>}
                  {location && <> in <span className="text-white font-medium">{location}</span></>}
                </p>
              )}
              <JobList
                jobs={jobs}
                loading={loading}
                savedJobIds={savedJobIds}
                onSave={handleSave}
                page={page}
                onPageChange={handlePageChange}
                hasMore={hasMore}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-8 text-gray-500">Loading...</div>}>
      <JobsPageInner />
    </Suspense>
  );
}
