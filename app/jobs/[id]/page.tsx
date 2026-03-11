import { notFound } from 'next/navigation';
import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import Job from '@/models/Job';
import GeneratePanel from '@/components/generate/GeneratePanel';
import { Job as JobType } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getJob(id: string): Promise<JobType | null> {
  try {
    await connectDB();
    const decodedId = decodeURIComponent(id);
    const job = await Job.findOne({
      $or: [{ jobId: decodedId }, { _id: decodedId.match(/^[0-9a-fA-F]{24}$/) ? decodedId : null }],
    }).lean();
    if (!job) return null;
    return {
      jobId: (job as { jobId: string }).jobId,
      title: (job as { title: string }).title,
      company: (job as { company: string }).company,
      location: (job as { location: string }).location,
      description: (job as { description: string }).description,
      salary: (job as { salary?: string }).salary,
      jobType: (job as { jobType?: string }).jobType,
      source: (job as { source: 'adzuna' | 'jsearch' }).source,
      sourceUrl: (job as { sourceUrl: string }).sourceUrl,
      postedDate: (job as { postedDate?: Date }).postedDate?.toISOString(),
      tags: (job as { tags?: string[] }).tags,
    };
  } catch {
    return null;
  }
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    notFound();
  }

  const postedDate = job.postedDate
    ? new Date(job.postedDate).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  // Format description: split on double newline or periods followed by capital letters
  const descParagraphs = job.description
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/jobs" className="hover:text-[#4a9eda] transition-colors">
          Find Jobs
        </Link>
        <span>/</span>
        <span className="text-gray-300 truncate max-w-xs">{job.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left panel — Job Detail */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">{job.title}</h1>
                <p className="text-[#4a9eda] font-medium">{job.company}</p>
              </div>
              <span
                className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${
                  job.source === 'adzuna'
                    ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                    : 'bg-orange-500/10 text-orange-300 border-orange-500/30'
                }`}
              >
                {job.source === 'adzuna' ? 'Adzuna' : 'JSearch'}
              </span>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400 mb-5">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </span>
              {job.salary && (
                <span className="flex items-center gap-1.5 text-green-400/80">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {job.salary}
                </span>
              )}
              {job.jobType && (
                <span className="capitalize">{job.jobType.replace(/_/g, ' ')}</span>
              )}
              {postedDate && <span>Posted {postedDate}</span>}
            </div>

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-[#1F4E79]/10 text-[#4a9eda]/70 border border-[#1F4E79]/20 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#4a9eda] hover:underline"
            >
              View original posting
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Description */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">Job Description</h2>
            <div className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed space-y-3">
              {descParagraphs.length > 1 ? (
                descParagraphs.map((para, i) => <p key={i}>{para}</p>)
              ) : (
                <p className="whitespace-pre-wrap">{job.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right panel — Generate */}
        <div className="w-full lg:w-96 shrink-0">
          <GeneratePanel job={job} />
        </div>
      </div>
    </div>
  );
}
