import { Job } from '@/types';

const JSEARCH_BASE_URL = 'https://jsearch.p.rapidapi.com/search';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

interface JSearchResult {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_description: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_employment_type?: string;
  job_apply_link: string;
  job_posted_at_datetime_utc?: string;
}

interface JSearchResponse {
  data: JSearchResult[];
}

export async function fetchJSearchJobs(
  keyword: string,
  location: string,
  page = 1
): Promise<Job[]> {
  if (!RAPIDAPI_KEY) {
    console.warn('RapidAPI key not configured');
    return [];
  }

  const params = new URLSearchParams({
    query: `${keyword} in ${location}`,
    page: String(page),
    num_pages: '1',
  });

  const response = await fetch(`${JSEARCH_BASE_URL}?${params.toString()}`, {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    console.error(`JSearch API error: ${response.status} ${response.statusText}`);
    return [];
  }

  const data: JSearchResponse = await response.json();

  return (data.data || []).map((item) => {
    const locationParts = [item.job_city, item.job_state, item.job_country]
      .filter(Boolean)
      .join(', ');

    let salary: string | undefined;
    if (item.job_min_salary && item.job_max_salary) {
      const currency = item.job_salary_currency || 'CAD';
      salary = `${currency} $${Math.round(item.job_min_salary / 1000)}k - $${Math.round(item.job_max_salary / 1000)}k`;
    }

    return {
      jobId: `jsearch_${item.job_id}`,
      title: item.job_title,
      company: item.employer_name,
      location: locationParts || 'Canada',
      description: item.job_description,
      salary,
      jobType: item.job_employment_type || undefined,
      source: 'jsearch' as const,
      sourceUrl: item.job_apply_link,
      postedDate: item.job_posted_at_datetime_utc,
      tags: extractTags(item.job_title + ' ' + item.job_description),
    };
  });
}

function extractTags(text: string): string[] {
  const keywords = [
    'React', 'Next.js', 'Node.js', 'TypeScript', 'JavaScript', 'Python',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'AWS', 'Azure', 'GCP',
    'Docker', 'Kubernetes', 'GraphQL', 'REST API', 'Vue', 'Angular',
    'Express', 'Tailwind', 'Git', 'Agile', 'Scrum', 'CI/CD',
  ];
  return keywords.filter((kw) => new RegExp(kw, 'i').test(text));
}
