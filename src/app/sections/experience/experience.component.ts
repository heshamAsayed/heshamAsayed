import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
  viewChild
} from '@angular/core';
import { EXPERIENCE_ITEMS } from '../../core/constants/portfolio-data';
import { SectionLabelComponent } from '../../shared/components/section-label/section-label.component';
import { TerminalWindowComponent } from '../../shared/components/terminal-window/terminal-window.component';
import { clearTimerBag, typeLinesToSignal, waitFor } from '../../shared/utils/typing.utils';

@Component({
  selector: 'app-experience-section',
  standalone: true,
  imports: [CommonModule, SectionLabelComponent, TerminalWindowComponent],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperienceSectionComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly terminalTimers: number[] = [];
  private readonly experienceSection = viewChild.required<ElementRef<HTMLElement>>('experienceSection');

  protected readonly items = EXPERIENCE_ITEMS;
  protected readonly terminalLines = signal<string[]>([]);
  protected readonly terminalCollapsed = signal(false);
  protected readonly timelineVisible = signal(false);
  protected readonly animationFinished = signal(false);

  private readonly terminalScript = [
    'hesham@experience:~$ docker run --name WorkHistory hesham/career:latest',
    'Pulling image hesham/career:latest ...',
    'Image pulled successfully.',
    '',
    'Starting container WorkHistory...',
    '✓ Container started.',
    '',
    'Loading experience tree...',
    '',
    'career/',
    '├── freelance/',
    '│   └── Zad-Construction-Solutions.job      [Oct 2025 → Mar 2026]',
    '└── internship/',
    '    └── ITI-FullStack.job                   [Jul 2025 → Dec 2025]',
    '',
    '→ 2 jobs loaded. Rendering timeline...'
  ];

  private hasStarted = false;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !this.hasStarted) {
          this.hasStarted = true;
          void this.startTerminalAnimation();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(this.experienceSection().nativeElement);
  }

  ngOnDestroy(): void {
    clearTimerBag(this.terminalTimers);
  }

  protected toggleTerminal(): void {
    if (!this.animationFinished()) {
      return;
    }

    this.terminalCollapsed.update((isCollapsed) => !isCollapsed);
  }

  protected formatTerminalLine(line: string): string {
    return this.escapeHtml(line)
      .replace(/^hesham@experience:~\$/, '<span class="term-success">hesham@experience:~$</span>')
      .replace('docker run --name WorkHistory hesham/career:latest', '<span class="term-cyan">docker run --name WorkHistory hesham/career:latest</span>')
      .replace(/✓/g, '<span class="term-success">✓</span>')
      .replace(/→/g, '<span class="term-accent">→</span>');
  }

  private async startTerminalAnimation(): Promise<void> {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.terminalLines.set(this.terminalScript);
      this.timelineVisible.set(true);
      this.animationFinished.set(true);
      this.terminalCollapsed.set(true);
      return;
    }

    await typeLinesToSignal(this.terminalScript, this.terminalLines, this.terminalTimers, 10, 24);

    this.timelineVisible.set(true);
    this.animationFinished.set(true);
    await waitFor(this.terminalTimers, 520);
    this.terminalCollapsed.set(true);
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }
}
