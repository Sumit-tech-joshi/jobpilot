import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/models/Job';
import { fetchAdzunaJobs } from '@/lib/adzuna';
import { fetchJSearchJobs } from '@/lib/jsearch';
import { Job as JobType } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || 'software developer';
    const location = searchParams.get('location') || 'Canada';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const source = searchParams.get('source') || 'both';

    await connectDB();

    // Fetch from APIs in parallel
    const fetches: Promise<JobType[]>[] = [];

    if (source === 'adzuna' || source === 'both') {
      fetches.push(fetchAdzunaJobs(keyword, location, page));
    }
    if (source === 'jsearch' || source === 'both') {
      // Small delay to avoid rate limit conflicts when running both in parallel
      fetches.push(
        new Promise((resolve) =>
          setTimeout(() => resolve(fetchJSearchJobs(keyword, location, page)), 200)
        )
      );
    }

    const results = await Promise.allSettled(fetches);

    let allJobs: JobType[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allJobs = allJobs.concat(result.value);
      }
    }

    // Deduplicate by title + company
    const seen = new Set<string>();
    const deduplicated = allJobs.filter((job) => {
      const key = `${job.title.toLowerCase()}::${job.company.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Save fetched jobs to MongoDB (upsert by jobId)
    if (deduplicated.length > 0) {
      const ops = deduplicated.map((job) => ({
        updateOne: {
          filter: { jobId: job.jobId },
          update: {
            $setOnInsert: {
              ...job,
              postedDate: job.postedDate ? new Date(job.postedDate) : undefined,
            },
          },
          upsert: true,
        },
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await Job.bulkWrite(ops as any);
    }

    return NextResponse.json({
      jobs: deduplicated,
      total: deduplicated.length,
      page,
    });
  } catch (error) {
    console.error('GET /api/jobs error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
