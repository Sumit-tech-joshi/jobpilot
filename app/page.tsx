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
    { label: 'Jobs Saved', value: stats.totalSaved, color: 'text-gray-300', border: 'border-[#30363d]' },
    { label: 'Applied', value: stats.totalApplied, color: 'text-blue-300', border: 'border-blue-500/30' },
    { label: 'Interviewing', value: stats.totalInterviewing, color: 'text-yellow-300', border: 'border-yellow-500/30' },
    { label: 'Offers', value: stats.totalOffers, color: 'text-green-300', border: 'border-green-500/30' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-[#1F4E79]/20 text-[#4a9eda] px-2.5 py-1 rounded-full border border-[#1F4E79]/40">
            AI-Powered
          </span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">
          Welcome to{' '}
          <span className="text-[#4a9eda]">Job</span>
          <span className="text-white">Pilot</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl">
          Search real job listings, generate tailored resumes and cover letters with Claude AI, and track your applications — all in one place.
        </p>
      </div>

      {/* Quick Search */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-8">
        <h2 className="text-white font-semibold mb-4">Find Jobs</h2>
        <form action="/jobs" method="get" className="flex flex-col sm:flex-row gap-3">
          <input
            name="keyword"
            type="text"
            placeholder="Job title, keyword..."
            className="flex-1 bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1F4E79] focus:ring-1 focus:ring-[#1F4E79]"
          />
          <input
            name="location"
            type="text"
            placeholder="Location..."
            defaultValue="Canada"
            className="flex-1 sm:max-w-[200px] bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1F4E79] focus:ring-1 focus:ring-[#1F4E79]"
          />
          <button
            type="submit"
            className="bg-[#1F4E79] hover:bg-[#2563a0] text-white font-medium px-6 py-3 rounded-lg text-sm transition-colors whitespace-nowrap"
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
            className={`bg-[#161b22] border ${card.border} rounded-xl p-5 text-center`}
          >
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-gray-500 text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">Recent Activity</h2>
          <Link href="/applications" className="text-sm text-[#4a9eda] hover:underline">
            View all
          </Link>
        </div>

        {stats.recentApps.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-sm">No activity yet.</p>
            <Link href="/jobs" className="text-[#4a9eda] text-sm hover:underline mt-1 inline-block">
              Start searching for jobs
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#30363d]">
            {stats.recentApps.map((app) => {
              const job = app.jobId as { title?: string; company?: string; jobId?: string } | null;
              const statusColors: Record<string, string> = {
                saved: 'text-gray-400',
                applied: 'text-blue-400',
                interviewing: 'text-yellow-400',
                rejected: 'text-red-400',
                offer: 'text-green-400',
              };
              return (
                <div
                  key={String(app._id)}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{job?.title || 'Unknown Job'}</p>
                    <p className="text-gray-500 text-xs">{job?.company || ''}</p>
                  </div>
                  <span className={`text-xs font-medium capitalize ${statusColors[app.status as string] || 'text-gray-400'}`}>
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
            desc: 'Pulls live jobs from Adzuna and JSearch APIs with deduplication.',
            icon: '🔍',
            href: '/jobs',
          },
          {
            title: 'AI-Tailored Documents',
            desc: 'Claude rewrites your resume and cover letter for each specific job.',
            icon: '📄',
            href: '/jobs',
          },
          {
            title: 'Application Tracker',
            desc: 'Track saved, applied, interviewing, rejected, and offers.',
            icon: '📊',
            href: '/applications',
          },
        ].map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-[#1F4E79]/50 transition-colors group"
          >
            <span className="text-2xl mb-3 block">{card.icon}</span>
            <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-[#4a9eda] transition-colors">
              {card.title}
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
