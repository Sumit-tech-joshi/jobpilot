'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Job } from '@/types';
import JobSearch from '@/components/jobs/JobSearch';
import JobList from '@/components/jobs/JobList';
import { Suspense } from 'react';

const CATEGORIES = [
  {
    group: 'Developer',
    items: [
      'Software Developer',
      'Full Stack Developer',
      'Frontend Developer',
      'Backend Developer',
      'Web Developer',
      'React Developer',
      'Node.js Developer',
      'JavaScript Developer',
      'Mobile Developer',
    ],
  },
  {
    group: 'Analyst',
    items: [
      'Data Analyst',
      'Business Analyst',
      'Systems Analyst',
      'IT Analyst',
      'Technical Analyst',
    ],
  },
  {
    group: 'Ops & Cloud',
    items: [
      'DevOps Engineer',
      'Cloud Engineer',
      'Database Administrator',
      'Cybersecurity Analyst',
      'Network Engineer',
    ],
  },
  {
    group: 'Other IT',
    items: [
      'QA Engineer',
      'IT Project Manager',
      'IT Consultant',
      'Scrum Master',
    ],
  },
];

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
  const [activeCategory, setActiveCategory] = useState('');

  const keyword = searchParams.get('keyword') || '';
  const location = searchParams.get('location') || '';

  const fetchJobs = useCallback(
    async (kw: string, loc: string, pg: number, src: string, cat: string) => {
      if (!kw && !loc && !cat) return;
      setLoading(true);
      setError(null);
      try {
        // Combine keyword + category into one search query
        const searchQuery = [kw, cat].filter(Boolean).join(' ') || 'IT jobs';
        const searchLocation = loc || 'Canada';
        const params = new URLSearchParams({
          keyword: searchQuery,
          location: searchLocation,
          page: String(pg),
          source: src,
        });
        const res = await fetch(`/api/jobs?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        const fetchedJobs: Job[] = data.jobs || [];
        console.log(`[JobPilot] query="${searchQuery}" location="${searchLocation}" source=${src} page=${pg} → ${fetchedJobs.length} jobs`);
        fetchedJobs.forEach((job, i) => {
          console.log(`  [${i + 1}] [${job.source}] ${job.title} @ ${job.company} (${job.location})`);
        });
        setJobs(fetchedJobs);
        setHasMore(fetchedJobs.length >= 10);
      } catch {
        setError('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (keyword || location || activeCategory) {
      fetchJobs(keyword, location, page, source, activeCategory);
    }
  }, [keyword, location, page, source, activeCategory, fetchJobs]);

  function handleSearch(kw: string, loc: string) {
    setPage(1);
    const params = new URLSearchParams({ keyword: kw, location: loc });
    router.push(`/jobs?${params.toString()}`);
  }

  function handleCategoryClick(cat: string) {
    const newCat = activeCategory === cat ? '' : cat; // toggle off if already active
    setActiveCategory(newCat);
    setPage(1);
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

  const hasSearch = !!(keyword || location || activeCategory);
  const displayQuery = [keyword, activeCategory].filter(Boolean).join(' + ');

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
          initialLocation={location || 'Canada'}
        />
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 sticky top-24 space-y-5">

            {/* Source filter */}
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Source</p>
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

            <div className="border-t border-[#30363d]" />

            {/* Category filter */}
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">Job Category</p>
              {CATEGORIES.map(({ group, items }) => (
                <div key={group} className="mb-4">
                  <p className="text-gray-600 text-xs font-medium uppercase tracking-wide mb-1.5">{group}</p>
                  {items.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className={`w-full text-left text-sm px-2 py-1 rounded-md mb-0.5 transition-colors ${
                        activeCategory === cat
                          ? 'bg-[#1F4E79]/30 text-[#4a9eda] font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-[#30363d]'
                      }`}
                    >
                      {activeCategory === cat && <span className="mr-1">›</span>}
                      {cat}
                    </button>
                  ))}
                </div>
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

          {/* Active category badge */}
          {activeCategory && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-gray-500">Category:</span>
              <span className="inline-flex items-center gap-1.5 bg-[#1F4E79]/20 text-[#4a9eda] border border-[#1F4E79]/40 text-xs font-medium px-2.5 py-1 rounded-full">
                {activeCategory}
                <button
                  onClick={() => setActiveCategory('')}
                  className="hover:text-white transition-colors ml-0.5"
                  aria-label="Clear category"
                >
                  ×
                </button>
              </span>
            </div>
          )}

          {!hasSearch && !loading && (
            <div className="text-center py-20 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg font-medium text-gray-400">Search or pick a category</p>
              <p className="text-sm mt-1">Enter a keyword, select a category, or choose a city to find IT jobs</p>
            </div>
          )}

          {hasSearch && (
            <>
              {!loading && jobs.length > 0 && (
                <p className="text-gray-500 text-sm mb-4">
                  Found <span className="text-white font-medium">{jobs.length}</span> jobs
                  {displayQuery && <> for <span className="text-white font-medium">"{displayQuery}"</span></>}
                  {(location || (!keyword && !activeCategory)) && (
                    <> in <span className="text-white font-medium">{location || 'Canada'}</span></>
                  )}
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
