import { Job } from '@/types';

const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs/ca/search/1';
const APP_ID = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;

interface AdzunaResult {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  redirect_url: string;
  created: string;
}

interface AdzunaResponse {
  results: AdzunaResult[];
}

export async function fetchAdzunaJobs(
  keyword: string,
  location: string,
  page = 1
): Promise<Job[]> {
  if (!APP_ID || !APP_KEY) {
    console.warn('Adzuna API credentials not configured');
    return [];
  }

  const params = new URLSearchParams({
    app_id: APP_ID,
    app_key: APP_KEY,
    what: keyword,
    where: location,
    results_per_page: '10',
    page: String(page),
  });

  const response = await fetch(`${ADZUNA_BASE_URL}?${params.toString()}`, {
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    console.error(`Adzuna API error: ${response.status} ${response.statusText}`);
    return [];
  }

  const data: AdzunaResponse = await response.json();

  return (data.results || []).map((item) => {
    let salary: string | undefined;
    if (item.salary_min && item.salary_max) {
      salary = `$${Math.round(item.salary_min / 1000)}k - $${Math.round(item.salary_max / 1000)}k`;
    } else if (item.salary_min) {
      salary = `From $${Math.round(item.salary_min / 1000)}k`;
    }

    return {
      jobId: `adzuna_${item.id}`,
      title: item.title,
      company: item.company.display_name,
      location: item.location.display_name,
      description: item.description,
      salary,
      jobType: item.contract_time || undefined,
      source: 'adzuna' as const,
      sourceUrl: item.redirect_url,
      postedDate: item.created,
      tags: extractTags(item.title + ' ' + item.description),
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
