import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFacebook,
  faGithub,
  faLinkedin,
  faWhatsapp
} from '@fortawesome/free-brands-svg-icons';
import {
  CONTACT_ENTRIES,
  FOOTER_NAV,
  FOOTER_PROJECTS,
  SOCIAL_LINKS
} from '../../core/constants/portfolio-data';
import { SectionLabelComponent } from '../../shared/components/section-label/section-label.component';

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, SectionLabelComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactSectionComponent {
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly contactEntries = CONTACT_ENTRIES;
  protected readonly socialLinks = SOCIAL_LINKS;
  protected readonly footerProjects = FOOTER_PROJECTS;
  protected readonly footerNav = FOOTER_NAV;
  protected readonly faGithub = faGithub;
  protected readonly faLinkedin = faLinkedin;
  protected readonly faWhatsapp = faWhatsapp;
  protected readonly faFacebook = faFacebook;
  protected readonly submitState = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  protected readonly formValue = {
    name: '',
    email: '',
    message: ''
  };

  protected async submitForm(): Promise<void> {
    if (!this.formValue.name || !this.formValue.email || !this.formValue.message) {
      this.submitState.set('error');
      return;
    }

    this.submitState.set('loading');

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const subject = encodeURIComponent(`Portfolio message from ${this.formValue.name}`);
    const body = encodeURIComponent(
      `Name: ${this.formValue.name}\nEmail: ${this.formValue.email}\n\n${this.formValue.message}`
    );

    await new Promise((resolve) => window.setTimeout(resolve, 550));
    window.location.href = `mailto:heshmahmed146@gmail.com?subject=${subject}&body=${body}`;
    this.submitState.set('success');
  }

  protected footerIcon(platform: string) {
    switch (platform) {
      case 'github':
        return this.faGithub;
      case 'linkedin':
        return this.faLinkedin;
      case 'whatsapp':
        return this.faWhatsapp;
      default:
        return this.faFacebook;
    }
  }
}
