import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faGithub,
  faLinkedin,
  faWhatsapp
} from '@fortawesome/free-brands-svg-icons';
import {
  faDownload,
  faEye,
  faPaperPlane
} from '@fortawesome/free-solid-svg-icons';
import {
  CV_FILE_PATH,
  PROFILE_IMAGE_PATH,
  SOCIAL_LINKS
} from '../../core/constants/portfolio-data';
import { GithubService } from '../../core/services/github.service';
import {
  clearTimerBag,
  deleteTextFromSignal,
  typeTextToSignal,
  waitFor
} from '../../shared/utils/typing.utils';
import { SectionLabelComponent } from '../../shared/components/section-label/section-label.component';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, SectionLabelComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroSectionComponent implements AfterViewInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly github = inject(GithubService);
  private readonly roleTimers: number[] = [];
  private readonly imageTimers: number[] = [];

  protected readonly socialLinks = SOCIAL_LINKS.filter((link) => link.platform !== 'facebook');
  protected readonly profileImagePath = PROFILE_IMAGE_PATH;
  protected readonly typedRole = signal('');
  protected readonly overlayVisible = signal(false);
  protected readonly overlayLines = signal<string[]>([]);
  protected readonly overlayProgress = signal(0);
  protected readonly overlayProgressVisible = signal(false);
  protected readonly imageEnhanced = signal(false);
  protected readonly isImageAnimating = signal(false);
  protected readonly isImageZoomed = signal(false);
  protected readonly projectCount = computed(() => this.github.projectCount());
  protected readonly faGithub = faGithub;
  protected readonly faLinkedin = faLinkedin;
  protected readonly faWhatsapp = faWhatsapp;
  protected readonly faDownload = faDownload;
  protected readonly faEye = faEye;
  protected readonly faPaperPlane = faPaperPlane;
  protected readonly projectFetchComment = computed(() => {
    const fetchState = this.github.fetchState();

    if (fetchState === 'success') {
      return '// fetch from github: success';
    }

    if (fetchState === 'error') {
      return '// fetch from github: error';
    }

    if (fetchState === 'loading') {
      return '// fetch from github: loading';
    }

    return '// fetch from github: waiting';
  });
  protected readonly projectDisplay = computed(() => {
    const count = this.projectCount();
    return count === null ? '...' : String(count);
  });

  private overlayToken = 0;
  private readonly roleLoopValues = ['.NET Developer', 'Software Engineer'];
  private readonly overlayScript = [
    '> scanning profile...',
    '> detected: Hesham Ahmed',
    '> confidence: 98.2%',
    '> face detected: true',
    '> applying enhancement pipeline...',
    '>',
    '> [scale]      .............. ✓',
    '> [sharpen]    .............. ✓',
    '> [contrast]   .............. ✓',
    '> [glow]       .............. ✓'
  ];

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.startRoleTyping();
  }

  ngOnDestroy(): void {
    this.clearRoleTimers();
    this.clearImageTimers();
  }

  protected openSocialLink(url: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  protected downloadCv(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const link = this.document.createElement('a');
    link.href = CV_FILE_PATH;
    link.download = 'Hesham Ahmed CV.pdf';
    link.click();
  }

  protected viewCv(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.open(CV_FILE_PATH, '_blank', 'noopener,noreferrer');
  }

  protected onImageEnter(): void {
    if (!isPlatformBrowser(this.platformId) || this.isImageAnimating()) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.overlayVisible.set(true);
      this.overlayLines.set([
        ...this.overlayScript,
        '> ✓ Enhancement applied successfully.'
      ]);
      this.overlayProgressVisible.set(true);
      this.overlayProgress.set(92);
      this.overlayVisible.set(false);
      this.isImageZoomed.set(true);
      return;
    }

    this.overlayToken += 1;
    void this.runImageSequence(this.overlayToken);
  }

  protected onImageLeave(): void {
    this.overlayToken += 1;
    this.clearImageTimers();
    this.overlayVisible.set(false);
    this.overlayLines.set([]);
    this.overlayProgressVisible.set(false);
    this.overlayProgress.set(0);
    this.imageEnhanced.set(false);
    this.isImageAnimating.set(false);
    this.isImageZoomed.set(false);
  }

  protected formatOverlayLine(line: string): string {
    return this.escapeHtml(line)
      .replace(/^&gt;/, '<span class="term-success">&gt;</span>')
      .replace('Hesham Ahmed', '<span class="term-cyan">Hesham Ahmed</span>')
      .replace('98.2%', '<span class="term-warning">98.2%</span>')
      .replace('true', '<span class="term-success">true</span>')
      .replace(/✓/g, '<span class="term-success">✓</span>');
  }

  protected iconForPlatform(platform: string) {
    switch (platform) {
      case 'github':
        return this.faGithub;
      case 'linkedin':
        return this.faLinkedin;
      default:
        return this.faWhatsapp;
    }
  }

  private startRoleTyping(): void {
    void this.runRoleLoop();
  }

  private async runImageSequence(token: number): Promise<void> {
    this.clearImageTimers();
    this.overlayLines.set([]);
    this.overlayVisible.set(false);
    this.overlayProgressVisible.set(false);
    this.overlayProgress.set(0);
    this.imageEnhanced.set(false);
    this.isImageAnimating.set(true);

    if (!(await this.delay(300, token))) {
      return;
    }

    this.overlayVisible.set(true);

    for (const line of this.overlayScript) {
      const didCompleteLine = await this.typeOverlayLine(line, token);

      if (!didCompleteLine) {
        return;
      }
    }

    this.overlayProgressVisible.set(true);

    for (let progress = 0; progress <= 82; progress += 2) {
      if (!(await this.delay(22, token))) {
        return;
      }

      this.overlayProgress.set(progress);
    }

    this.overlayLines.update((lines) => [...lines, '> ✓ Enhancement applied successfully.']);
    this.imageEnhanced.set(true);
    this.overlayVisible.set(false);
    this.isImageZoomed.set(true);
    this.isImageAnimating.set(false);
  }

  private async typeOverlayLine(line: string, token: number): Promise<boolean> {
    this.overlayLines.update((lines) => [...lines, '']);

    for (let index = 1; index <= line.length; index += 1) {
      if (!(await this.delay(10, token))) {
        return false;
      }

      this.overlayLines.update((lines) => {
        const nextLines = [...lines];
        nextLines[nextLines.length - 1] = line.slice(0, index);
        return nextLines;
      });
    }

    return true;
  }

  private delay(milliseconds: number, token: number): Promise<boolean> {
    return new Promise((resolve) => {
      const timer = window.setTimeout(() => {
        resolve(this.overlayToken === token);
      }, milliseconds);

      this.imageTimers.push(timer);
    });
  }

  private clearRoleTimers(): void {
    clearTimerBag(this.roleTimers);
  }

  private clearImageTimers(): void {
    clearTimerBag(this.imageTimers);
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  private async runRoleLoop(): Promise<void> {
    while (isPlatformBrowser(this.platformId)) {
      for (const role of this.roleLoopValues) {
        await typeTextToSignal(role, this.typedRole, this.roleTimers, 30);
        await waitFor(this.roleTimers, 850);
        await deleteTextFromSignal(this.typedRole, this.roleTimers, 30);
        await waitFor(this.roleTimers, 400);
      }
    }
  }
}
