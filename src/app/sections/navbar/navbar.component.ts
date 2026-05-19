import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { NAV_ITEMS } from '../../core/constants/portfolio-data';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-navbar-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarSectionComponent implements AfterViewInit {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly theme = inject(ThemeService);
  protected readonly navItems = NAV_ITEMS;
  protected readonly activeSection = signal('home');
  protected readonly isScrolled = signal(false);
  protected readonly isMobileMenuOpen = signal(false);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.updateScrollState();
    this.observeSections();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateScrollState();
  }

  protected scrollToSection(sectionId: string): void {
    const section = this.document.getElementById(sectionId);
    this.activeSection.set(sectionId);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.isMobileMenuOpen.set(false);
  }

  protected toggleMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  protected toggleTheme(): void {
    this.theme.toggleTheme();
  }

  private updateScrollState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isScrolled.set(window.scrollY > 20);
  }

  private observeSections(): void {
    const sections = Array.from(this.document.querySelectorAll<HTMLElement>('[data-nav-section]'));

    if (!sections.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
            this.activeSection.set(entry.target.id);
          }
        });
      },
      {
        threshold: [0, 0.1, 0.25, 0.5],
        rootMargin: '0px 0px -50% 0px'
      }
    );

    sections.forEach((section) => observer.observe(section));
  }
}
