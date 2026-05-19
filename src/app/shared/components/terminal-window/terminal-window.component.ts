import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-terminal-window',
  standalone: true,
  templateUrl: './terminal-window.component.html',
  styleUrl: './terminal-window.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TerminalWindowComponent {
  readonly title = input.required<string>();
  readonly lines = input.required<string[]>();
  readonly collapsed = input(false);
  readonly canToggle = input(false);
  readonly formatLine = input<(line: string) => string>((line) => line);
  readonly toggle = output<void>();

  protected readonly parsedLines = computed(() => {
    return this.lines().map((line) => this.parseLine(line));
  });

  protected onToggle(): void {
    this.toggle.emit();
  }

  private parseLine(line: string): { prompt: string; content: string } {
    // Match lines that contain a terminal prompt
    const promptMatch = line.match(/^(.+?[@:].*?\$)\s+(.*)$/);
    
    if (promptMatch) {
      return {
        prompt: promptMatch[1],
        content: promptMatch[2]
      };
    }

    return {
      prompt: '',
      content: line
    };
  }
}
