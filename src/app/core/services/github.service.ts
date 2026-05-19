import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import {
  GITHUB_USERNAME
} from '../constants/portfolio-data';
import {
  AsyncFetchState,
  GithubApiRepo,
  RepoCategory,
  RepoViewModel
} from '../models/portfolio.models';

@Injectable({ providedIn: 'root' })
export class GithubService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiHeaders = {
    Accept: 'application/vnd.github+json'
  };

  readonly repos = signal<RepoViewModel[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly projectCount = signal<number | null>(null);
  readonly fetchState = signal<AsyncFetchState>('idle');

  private readonly readmeCache = new Map<string, string | null>();
  private readonly languagesCache = new Map<string, Record<string, number>>();
  private hasLoaded = false;

  async loadRepos(force = false): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if ((this.hasLoaded || this.loading()) && !force) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.fetchState.set('loading');

    try {
      const response = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=created&direction=desc`,
        { headers: this.apiHeaders }
      );

      if (!response.ok) {
        throw new Error(`GitHub request failed with status ${response.status}`);
      }

      const repos = (await response.json()) as GithubApiRepo[];
      const ownRepos = repos; // Keep all repositories (do not exclude forks)

      const enrichedRepos = ownRepos.map((repo) => this.mapRepo(repo, {}));

      const sortedRepos = enrichedRepos.sort(
        (leftRepo, rightRepo) =>
          new Date(rightRepo.createdAt).getTime() - new Date(leftRepo.createdAt).getTime()
      );

      const featuredNames = new Set(
        sortedRepos
          .filter((repo) => repo.homepage || repo.stars > 0)
          .slice(0, 3)
          .map((repo) => repo.name)
      );

      this.repos.set(
        sortedRepos.map((repo) => ({
          ...repo,
          featured: featuredNames.has(repo.name)
        }))
      );
      this.projectCount.set(sortedRepos.length);
      this.fetchState.set('success');
      this.hasLoaded = true;
    } catch (error) {
      console.error(error);
      this.fetchState.set('error');
      this.error.set('Unable to reach GitHub right now. Please try again shortly.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadReadme(repoName: string): Promise<string | null> {
    if (this.readmeCache.has(repoName)) {
      return this.readmeCache.get(repoName) ?? null;
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/readme`,
        { headers: this.apiHeaders }
      );

      if (!response.ok) {
        this.readmeCache.set(repoName, null);
        return null;
      }

      const payload = (await response.json()) as { content?: string };
      const decodedReadme = payload.content ? this.decodeBase64(payload.content) : null;
      this.readmeCache.set(repoName, decodedReadme);
      return decodedReadme;
    } catch (error) {
      console.error(error);
      this.readmeCache.set(repoName, null);
      return null;
    }
  }

  async loadRepoLanguages(repoName: string): Promise<Record<string, number>> {
    if (this.languagesCache.has(repoName)) {
      return this.languagesCache.get(repoName) ?? {};
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/languages`,
        { headers: this.apiHeaders }
      );

      if (!response.ok) {
        return {};
      }

      const languages = (await response.json()) as Record<string, number>;
      this.languagesCache.set(repoName, languages);
      return languages;
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  updateRepoLanguages(repoName: string, languages: Record<string, number>): void {
    this.repos.update((currentRepos) =>
      currentRepos.map((repo) =>
        repo.name === repoName ? { ...repo, languages } : repo
      )
    );
  }

  private mapRepo(
    repo: GithubApiRepo,
    languages: Record<string, number>
  ): RepoViewModel {
    const topics = repo.topics ?? [];
    return {
      name: repo.name,
      description: repo.description ?? 'Repository shipped without a GitHub description yet.',
      htmlUrl: repo.html_url,
      homepage: repo.homepage ? this.normalizeUrl(repo.homepage) : null,
      language: repo.language ?? this.resolvePrimaryLanguage(languages),
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updatedAt: repo.updated_at,
      createdAt: repo.created_at,
      openIssues: repo.open_issues_count,
      archived: repo.archived,
      topics,
      languages,
      category: this.classifyRepo(topics),
      featured: false
    };
  }

  private normalizeUrl(url: string): string {
    if (!url) {
      return url;
    }

    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  }

  private resolvePrimaryLanguage(languages: Record<string, number>): string {
    const [primaryLanguage] = Object.entries(languages).sort((leftLanguage, rightLanguage) => {
      return rightLanguage[1] - leftLanguage[1];
    });

    return primaryLanguage?.[0] ?? 'Code';
  }

  private classifyRepo(topics: string[]): RepoCategory {
    const lowerTopics = topics.map((t) => t.toLowerCase().trim());

    if (
      lowerTopics.some(
        (t) =>
          t === 'full-stack' ||
          t === 'fullstack' ||
          t === 'full-stack-developer' ||
          t === 'full'
      )
    ) {
      return 'full-stack';
    }

    if (
      lowerTopics.some(
        (t) =>
          t === 'backend' ||
          t === 'back-end' ||
          t === 'back'
      )
    ) {
      return 'backend';
    }

    if (
      lowerTopics.some(
        (t) =>
          t === 'frontend' ||
          t === 'front-end' ||
          t === 'front' ||
          t === 'fortnent'
      )
    ) {
      return 'frontend';
    }

    return 'other';
  }

  private decodeBase64(value: string): string {
    const normalizedValue = value.replace(/\n/g, '');

    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      const binary = window.atob(normalizedValue);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }

    return Buffer.from(normalizedValue, 'base64').toString('utf8');
  }
}
