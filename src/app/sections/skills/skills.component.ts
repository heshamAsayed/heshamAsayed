import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SKILL_CATEGORIES } from '../../core/constants/portfolio-data';
import { SectionLabelComponent } from '../../shared/components/section-label/section-label.component';

@Component({
  selector: 'app-skills-section',
  standalone: true,
  imports: [CommonModule, SectionLabelComponent],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillsSectionComponent {
  protected readonly categories = SKILL_CATEGORIES;
}
