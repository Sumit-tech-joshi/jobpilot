import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';

async function getStats() {
  try {
    await connectDB();
    const [totalSaved, totalApplied, totalInterviewing, totalOffers, recentApps] = await Promise.all([
      Application.countDocuments({ status: 'saved' }),
      Application.countDocuments({ status: 'applied' }),
      Application.countDocuments({ status: 'interviewing' }),
      Application.countDocuments({ status: 'offer' }),
      Application.find().populate('jobId').sort({ updatedAt: -1 }).limit(5).lean(),
    ]);
    return { totalSaved, totalApplied, totalInterviewing, totalOffers, recentApps };
  } catch {
    return { totalSaved: 0, totalApplied: 0, totalInterviewing: 0, totalOffers: 0, recentApps: [] };
  }
}

export default async function HomePage() {
  const stats = await getStats();

  const statCards = [
    { label: 'Jobs Saved', value: stats.totalSaved, color: 'text-[#94A3B8]', topBorder: 'border-t-[#64748B]' },
    { label: 'Applied', value: stats.totalApplied, color: 'text-[#818CF8]', topBorder: 'border-t-[#6366F1]' },
    { label: 'Interviewing', value: stats.totalInterviewing, color: 'text-[#FCD34D]', topBorder: 'border-t-[#F59E0B]' },
    { label: 'Offers', value: stats.totalOffers, color: 'text-[#34D399]', topBorder: 'border-t-[#10B981]' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs bg-[#6366F1]/10 text-[#8B5CF6] px-3 py-1 rounded-full border border-[#6366F1]/25 font-medium">
            ✦ AI-Powered
          </span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">
            JobPilot
          </span>
        </h1>
        <p className="text-[#94A3B8] text-lg max-w-xl leading-relaxed">
          Search real job listings, generate tailored resumes and cover letters with AI, and track your applications — all in one place.
        </p>
      </div>

      {/* Quick Search */}
      <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6 mb-8">
        <h2 className="text-white font-semibold mb-4">Find Jobs</h2>
        <form action="/jobs" method="get" className="flex flex-col sm:flex-row gap-3">
          <input
            name="keyword"
            type="text"
            placeholder="Job title, keyword..."
            className="flex-1 bg-[#080C14] border border-white/[0.08] text-white placeholder-[#475569] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 transition-all"
          />
          <input
            name="location"
            type="text"
            placeholder="Location..."
            defaultValue="Canada"
            className="flex-1 sm:max-w-[200px] bg-[#080C14] border border-white/[0.08] text-white placeholder-[#475569] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 transition-all"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-90 text-white font-medium px-6 py-3 rounded-xl text-sm transition-all whitespace-nowrap shadow-lg shadow-[#6366F1]/20"
          >
            Search Jobs
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white/[0.02] backdrop-blur-sm border border-white/[0.07] border-t-2 ${card.topBorder} rounded-2xl p-5 text-center`}
          >
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-[#475569] text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">Recent Activity</h2>
          <Link href="/applications" className="text-sm text-[#8B5CF6] hover:text-[#A78BFA] transition-colors">
            View all
          </Link>
        </div>

        {stats.recentApps.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-[#475569]">No activity yet.</p>
            <Link href="/jobs" className="text-[#8B5CF6] text-sm hover:text-[#A78BFA] mt-1 inline-block transition-colors">
              Start searching for jobs
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {stats.recentApps.map((app) => {
              const job = app.jobId as { title?: string; company?: string; jobId?: string } | null;
              const statusColors: Record<string, string> = {
                saved: 'text-[#94A3B8]',
                applied: 'text-[#818CF8]',
                interviewing: 'text-[#FCD34D]',
                rejected: 'text-red-400',
                offer: 'text-[#34D399]',
              };
              return (
                <div
                  key={String(app._id)}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{job?.title || 'Unknown Job'}</p>
                    <p className="text-[#475569] text-xs">{job?.company || ''}</p>
                  </div>
                  <span className={`text-xs font-medium capitalize ${statusColors[app.status as string] || 'text-[#94A3B8]'}`}>
                    {app.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feature Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            title: 'Real Job Listings',
            desc: 'Pulls live jobs from Adzuna with deduplication and smart filtering.',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            ),
            href: '/jobs',
          },
          {
            title: 'AI-Tailored Documents',
            desc: 'AI rewrites your resume and cover letter for each specific job posting.',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
            href: '/jobs',
          },
          {
            title: 'Application Tracker',
            desc: 'Track saved, applied, interviewing, rejected, and offer stages.',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ),
            href: '/applications',
          },
        ].map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 hover:border-[#6366F1]/40 hover:bg-white/[0.04] transition-all duration-200 group"
          >
            <div className="w-10 h-10 bg-[#6366F1]/10 text-[#8B5CF6] rounded-xl flex items-center justify-center mb-4">
              {card.icon}
            </div>
            <h3 className="text-white font-semibold text-sm mb-1.5 group-hover:text-[#8B5CF6] transition-colors">
              {card.title}
            </h3>
            <p className="text-[#475569] text-xs leading-relaxed">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
