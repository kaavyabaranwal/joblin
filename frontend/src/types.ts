export interface Application {
  id: string;
  company: string;
  role: string;
  status: string;
  jobDescription?: string;
  notes?: string;
  dateApplied: string;
  skills: string[];
  seniority: string | null;
  salaryRange: string | null;
  remotePolicy: string | null;
  parseStatus: string;
}

export interface SimilarApplication {
  id: string;
  company: string;
  role: string;
  status: string;
  similarity: number;
}

export interface GapAnalysisResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: Array<{ original: string; improved: string; reason: string }>;
}