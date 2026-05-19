import { CommonModule, DatePipe, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
  viewChild
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RepoCategory, RepoViewModel } from '../../core/models/portfolio.models';
import { GithubService } from '../../core/services/github.service';
import { TerminalWindowComponent } from '../../shared/components/terminal-window/terminal-window.component';
import { SectionLabelComponent } from '../../shared/components/section-label/section-label.component';
import { clearTimerBag, typeLinesToSignal, waitFor } from '../../shared/utils/typing.utils';

type FilterOption = Exclude<RepoCategory, 'other'>;

@Component({
  selector: 'app-projects-section',
  standalone: true,
  imports: [CommonModule, DatePipe, SectionLabelComponent, TerminalWindowComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsSectionComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly github = inject(GithubService);
  private readonly projectsSection = viewChild.required<ElementRef<HTMLElement>>('projectsSection');
  private readonly previewUrls = new Map<string, SafeResourceUrl>();
  private readonly introTimers: number[] = [];
  private readonly fetcherTimers: number[] = [];
  private readonly rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  protected readonly filters: FilterOption[] = ['all', 'frontend', 'backend', 'full-stack'];
  protected readonly selectedFilter = signal<FilterOption>('all');
  protected readonly introLines = signal<string[]>([]);
  protected readonly fetcherLines = signal<string[]>([]);
  protected readonly introCollapsed = signal(false);
  protected readonly fetcherCollapsed = signal(false);
  protected readonly introReady = signal(false);
  protected readonly fetcherReady = signal(false);
  protected readonly modalRepo = signal<RepoViewModel | null>(null);
  protected readonly modalReadme = signal<string | null>(null);
  protected readonly modalLoading = signal(false);
  protected readonly visibleRepos = computed(() => {
    const currentFilter = this.selectedFilter();
    const repos = this.github.repos();
    return currentFilter === 'all' ? repos : repos.filter((repo) => repo.category === currentFilter);
  });

  protected readonly showRepos = computed(() => {
    return this.fetcherReady();
  });

  private hasStarted = false;
  private readonly introScript = [
    'hesham@projects:~$ dotnet run --project FilterApp.csproj',
    '',
    'Build succeeded.',
    '──────────────────────────────────────',
    'Initializing project filter...',
    '',
    'Available filters:',
    '  [0]  --all           → Show all repositories',
    '  [1]  --frontend      → Filter by: frontend',
    '  [2]  --backend       → Filter by: backend',
    '  [3]  --full-stack    → Filter by: full-stack',
    '',
    '✓ Filter options loaded. Select a filter to begin.'
  ];

  constructor() {
    effect(() => {
      for (const repo of this.github.repos()) {
        if (repo.homepage && !this.previewUrls.has(repo.name)) {
          this.previewUrls.set(
            repo.name,
            this.sanitizer.bypassSecurityTrustResourceUrl(repo.homepage)
          );
        }
      }
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !this.hasStarted) {
          this.hasStarted = true;
          void this.startSection();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(this.projectsSection().nativeElement);
  }

  ngOnDestroy(): void {
    clearTimerBag(this.introTimers);
    clearTimerBag(this.fetcherTimers);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalRepo()) {
      this.closeModal();
    }
  }

  protected async selectFilter(filter: FilterOption): Promise<void> {
    clearTimerBag(this.fetcherTimers);
    this.selectedFilter.set(filter);
    this.fetcherReady.set(false);
    this.fetcherCollapsed.set(false);
    
    // Wait for repos to load if still loading
    while (this.github.loading()) {
      await waitFor(this.fetcherTimers, 50);
    }
    
    await this.runFetcherAnimation();
  }

  protected getPreviewUrl(repo: RepoViewModel): SafeResourceUrl | null {
    return this.previewUrls.get(repo.name) ?? null;
  }

  protected languageBadgeColor(language: string): string {
    const colors: Record<string, string> = {
      'C#': '#9b59b6',
      TypeScript: '#2b7fff',
      JavaScript: '#facc15',
      HTML: '#f97316',
      CSS: '#38bdf8',
      SCSS: '#ec4899',
      Python: '#4ade80',
      Code: '#74c7ec'
    };

    return colors[language] ?? '#74c7ec';
  }

  protected relativeTime(dateValue: string): string {
    const delta = new Date(dateValue).getTime() - Date.now();
    const days = Math.round(delta / (1000 * 60 * 60 * 24));

    if (Math.abs(days) >= 30) {
      return `${Math.round(Math.abs(days) / 30)}mo ago`;
    }

    return this.rtf.format(days, 'day');
  }

  protected toggleIntroTerminal(): void {
    if (!this.introReady()) {
      return;
    }

    this.introCollapsed.update((isCollapsed) => !isCollapsed);
  }

  protected toggleFetcherTerminal(): void {
    if (!this.fetcherReady()) {
      return;
    }

    this.fetcherCollapsed.update((isCollapsed) => !isCollapsed);
  }

  protected repoTopics(repo: RepoViewModel): string[] {
    return repo.topics.length ? repo.topics.slice(0, 4) : [repo.category, repo.language.toLowerCase()];
  }

  protected languageBreakdown(repo: RepoViewModel): string[] {
    const totalBytes = Object.values(repo.languages).reduce((sum, value) => sum + value, 0) || 1;

    return Object.entries(repo.languages)
      .sort((leftLanguage, rightLanguage) => rightLanguage[1] - leftLanguage[1])
      .slice(0, 5)
      .map(([language, bytes]) => `${language} ${Math.round((bytes / totalBytes) * 100)}%`);
  }

  protected truncateDescription(description: string): string {
    const words = description.split(/\s+/).filter(Boolean);

    if (words.length <= 5) {
      return description;
    }

    return `${words.slice(0, 5).join(' ')} ...`;
  }

  protected formatTerminalLine(line: string): string {
    const formatted = this.escapeHtml(line)
      .replace(/^hesham@projects:~\$/, '<span class="term-success">hesham@projects:~$</span>')
      .replace(/^hesham@repos:~\$/, '<span class="term-success">hesham@repos:~$</span>')
      .replace(/GET https:\/\/api\.github\.com\/users\/heshamAsayed\/repos[^\s]*/g, '<span class="term-cyan">$&</span>')
      .replace(/Status: 200 OK/g, '<span class="term-success">Status: 200 OK</span>')
      .replace(/✓/g, '<span class="term-success">✓</span>')
      .replace(/✗/g, '<span class="term-danger">✗</span>')
      .replace(/→/g, '<span class="term-accent">→</span>');
    
    // Add zero-width space for empty lines to ensure they render
    return formatted || '&#8203;';
  }

  protected async openModal(repo: RepoViewModel): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.document.body.classList.add('modal-open');
    this.modalRepo.set(repo);
    this.modalReadme.set(null);
    this.modalLoading.set(true);

    const [readme, languages] = await Promise.all([
      this.github.loadReadme(repo.name),
      this.github.loadRepoLanguages(repo.name)
    ]);

    this.github.updateRepoLanguages(repo.name, languages);
    this.modalRepo.set({ ...repo, languages });
    this.modalReadme.set(readme);
    this.modalLoading.set(false);
  }

  protected closeModal(): void {
    this.document.body.classList.remove('modal-open');
    this.modalRepo.set(null);
    this.modalReadme.set(null);
    this.modalLoading.set(false);
  }

  protected renderMarkdown(markdown: string | null): string {
    if (!markdown) {
      return '<p>README preview is not available for this repository yet.</p>';
    }

    const lines = markdown.split('\n');
    const html: string[] = [];
    let inCodeBlock = false;
    let inList = false;

    for (const line of lines) {
      if (line.startsWith('```')) {
        if (inList) {
          html.push('</ul>');
          inList = false;
        }

        html.push(inCodeBlock ? '</code></pre>' : '<pre><code>');
        inCodeBlock = !inCodeBlock;
        continue;
      }

      if (inCodeBlock) {
        html.push(`${this.escapeHtml(line)}\n`);
        continue;
      }

      if (/^\s*[-*]\s+/.test(line)) {
        if (!inList) {
          html.push('<ul>');
          inList = true;
        }

        html.push(`<li>${this.renderInline(line.replace(/^\s*[-*]\s+/, ''))}</li>`);
        continue;
      }

      if (inList) {
        html.push('</ul>');
        inList = false;
      }

      if (!line.trim()) {
        continue;
      }

      if (line.startsWith('### ')) {
        html.push(`<h3>${this.renderInline(line.replace('### ', ''))}</h3>`);
        continue;
      }

      if (line.startsWith('## ')) {
        html.push(`<h2>${this.renderInline(line.replace('## ', ''))}</h2>`);
        continue;
      }

      if (line.startsWith('# ')) {
        html.push(`<h1>${this.renderInline(line.replace('# ', ''))}</h1>`);
        continue;
      }

      html.push(`<p>${this.renderInline(line)}</p>`);
    }

    if (inList) {
      html.push('</ul>');
    }

    if (inCodeBlock) {
      html.push('</code></pre>');
    }

    return html.join('');
  }

  private async startSection(): Promise<void> {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.introLines.set(this.introScript);
      void this.github.loadRepos();
      this.introReady.set(true);
      
      // Wait for repos to finish loading
      while (this.github.loading()) {
        await waitFor(this.fetcherTimers, 50);
      }

      await waitFor(this.fetcherTimers, 500);
      await this.runFetcherAnimation();
      return;
    }

    const introAnimation = typeLinesToSignal(this.introScript, this.introLines, this.introTimers, 5, 6);
    
    // Load repos in background without blocking
    void this.github.loadRepos();

    await introAnimation;
    this.introReady.set(true);
    await waitFor(this.introTimers, 520);

    // Wait for repos to finish loading
    while (this.github.loading()) {
      await waitFor(this.introTimers, 50);
    }

    await this.runFetcherAnimation();
  }

  private async runFetcherAnimation(): Promise<void> {
    const lines = this.buildFetcherLines();
    this.fetcherReady.set(false);
    await typeLinesToSignal(lines, this.fetcherLines, this.fetcherTimers, 4, 12);
    this.fetcherReady.set(true);
    await waitFor(this.fetcherTimers, 520);
    this.fetcherCollapsed.set(true);
  }

  private buildFetcherLines(): string[] {
    if (this.github.error()) {
      return [
        `hesham@repos:~$ dotnet run --project RepoFetcher.csproj --filter ${this.selectedFilter()}`,
        'Connecting to api.github.com ...',
        '✗ GitHub API request failed.',
        '→ Please try again later.'
      ];
    }

    const repos = this.github.repos();
    const selectedFilter = this.selectedFilter();

    if (selectedFilter === 'all') {
      const treeLines = repos.slice(0, 6).map((repo, index, array) => {
        const prefix = index === array.length - 1 && repos.length <= 6 ? '└──' : '├──';
        return `${prefix} ${repo.name.padEnd(18)} · ${repo.language.padEnd(10)} ★ ${repo.stars}`;
      });

      return [
        'hesham@repos:~$ dotnet run --project RepoFetcher.csproj --filter all',
        'Connecting to api.github.com ...',
        'GET https://api.github.com/users/heshamAsayed/repos?per_page=100&sort=created&direction=desc',
        'Status: 200 OK',
        `✓ Fetched ${repos.length} repositories. Sorting by: createdAt DESC`,
        'Repository tree:',
        'repos/',
        ...treeLines,
        ...(repos.length > 6 ? ['└── ...'] : []),
        `→ ${repos.length} repositories rendered.`
      ];
    }

    const matchedRepos = repos.filter((repo) => repo.category === selectedFilter).slice(0, 4);
    const skippedRepos = repos.filter((repo) => repo.category !== selectedFilter).slice(0, 2);

    return [
      `hesham@repos:~$ dotnet run --project RepoFetcher.csproj --filter ${selectedFilter}`,
      'Connecting to api.github.com ...',
      'Status: 200 OK',
      `Scanning topics for match: "${selectedFilter}" ...`,
      ...matchedRepos.map((repo) => `✓ ${repo.name.padEnd(18)} → matched  [${selectedFilter}]`),
      ...skippedRepos.map((repo) => `✗ ${repo.name.padEnd(18)} → skipped  [${repo.category}]`),
      '──────────────────────────────────────',
      `→ ${this.visibleRepos().length} matched. Rendering...`
    ];
  }

  private renderInline(value: string): string {
    return this.escapeHtml(value)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }
}
