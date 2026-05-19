export type ThemeMode = 'dark' | 'light';

export type RepoCategory = 'all' | 'frontend' | 'backend' | 'full-stack' | 'other';
export type AsyncFetchState = 'idle' | 'loading' | 'success' | 'error';

export type SocialPlatform = 'github' | 'linkedin' | 'whatsapp' | 'facebook';

export interface NavItem {
  id: string;
  label: string;
  index: string;
}

export interface SocialLink {
  label: string;
  display: string;
  url: string;
  platform: SocialPlatform;
  color: string;
}

export interface SkillItem {
  name: string;
  glyph: string;
  color: string;
}

export interface SkillCategory {
  label: string;
  skills: SkillItem[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location: string;
  codeLead: string;
  comments: string[];
}

export interface ContactEntry {
  key: string;
  value: string;
  href?: string;
  comment: string;
}

export interface FooterLink {
  label: string;
  target: string;
  external?: boolean;
}

export interface GithubApiRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  open_issues_count: number;
  created_at: string;
  archived: boolean;
  fork: boolean;
  topics?: string[];
}

export interface RepoViewModel {
  name: string;
  description: string;
  htmlUrl: string;
  homepage: string | null;
  language: string;
  stars: number;
  forks: number;
  updatedAt: string;
  createdAt: string;
  openIssues: number;
  archived: boolean;
  topics: string[];
  languages: Record<string, number>;
  category: RepoCategory;
  featured: boolean;
}
