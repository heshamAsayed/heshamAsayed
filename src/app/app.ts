import { Component, inject } from '@angular/core';
import { ContactSectionComponent } from './sections/contact/contact.component';
import { ExperienceSectionComponent } from './sections/experience/experience.component';
import { HeroSectionComponent } from './sections/hero/hero.component';
import { NavbarSectionComponent } from './sections/navbar/navbar.component';
import { ProjectsSectionComponent } from './sections/projects/projects.component';
import { SkillsSectionComponent } from './sections/skills/skills.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [
    NavbarSectionComponent,
    HeroSectionComponent,
    SkillsSectionComponent,
    ExperienceSectionComponent,
    ProjectsSectionComponent,
    ContactSectionComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly theme = inject(ThemeService);
}
