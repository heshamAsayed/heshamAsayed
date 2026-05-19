import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-section-label',
  standalone: true,
  templateUrl: './section-label.component.html',
  styleUrl: './section-label.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionLabelComponent {
  readonly label = input.required<string>();
  readonly hint = input<string>();
}
