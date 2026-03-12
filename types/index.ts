// Job from external API (before saving to DB)
export interface Job {
  jobId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  jobType?: string;
  source: 'adzuna' | 'jsearch';
  sourceUrl: string;
  postedDate?: string;
  tags?: string[];
}

// Job as stored in MongoDB
export interface SavedJob extends Job {
  _id: string;
  savedAt: string;
}

// Application status options
export type ApplicationStatus = 'saved' | 'applied' | 'interviewing' | 'rejected' | 'offer';

// Application record
export interface Application {
  _id: string;
  jobId: string | SavedJob;
  status: ApplicationStatus;
  appliedDate?: string;
  generatedResume?: string;
  generatedCoverLetter?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Resume structure returned by Claude
export interface GeneratedResume {
  summary: string;
  skills: {
    languages: string[];
    frameworks: string[];
    databases: string[];
    tools: string[];
    cloud: string[];
    platforms: string[];
    practices: string[];
  };
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    type: string;
    projects?: Array<{
      name: string;
      bullets: string[];
    }>;
    bullets?: string[];
    general?: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    startDate?: string;
    endDate: string;
    notes?: string;
  }>;
}

// Payload for resume generation
export interface GenerateResumePayload {
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  companyName: string;
}

// Payload for cover letter generation
export interface GenerateCoverLetterPayload {
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  companyName: string;
}

// Payload for document download
export interface DownloadPayload {
  type: 'resume' | 'coverletter';
  format: 'docx' | 'pdf';
  content: string;
  jobTitle: string;
  companyName: string;
}

// Job search query params
export interface JobSearchParams {
  keyword: string;
  location: string;
  page?: number;
  source?: 'adzuna' | 'jsearch' | 'both';
}

// Dashboard stats
export interface DashboardStats {
  totalSaved: number;
  totalApplied: number;
  totalInterviewing: number;
  totalOffers: number;
}
