import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { ThemeMode } from '../models/portfolio.models';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'hesham-portfolio-theme';

  readonly theme = signal<ThemeMode>('dark');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = window.localStorage.getItem(this.storageKey) as ThemeMode | null;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.theme.set(savedTheme ?? (prefersDark ? 'dark' : 'light'));
    }

    effect(() => {
      const activeTheme = this.theme();
      const rootElement = this.document?.documentElement;

      if (!rootElement) {
        return;
      }

      rootElement.setAttribute('data-theme', activeTheme);
      rootElement.style.colorScheme = activeTheme;

      if (isPlatformBrowser(this.platformId)) {
        window.localStorage.setItem(this.storageKey, activeTheme);
      }
    });
  }

  toggleTheme(): void {
    this.theme.update((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  }
}
