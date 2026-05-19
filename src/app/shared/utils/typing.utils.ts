import { WritableSignal } from '@angular/core';

export function clearTimerBag(timers: number[]): void {
  while (timers.length) {
    const timer = timers.pop();

    if (timer !== undefined) {
      window.clearTimeout(timer);
      window.clearInterval(timer);
    }
  }
}

export function waitFor(timers: number[], milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, milliseconds);
    timers.push(timer);
  });
}

export async function typeTextToSignal(
  text: string,
  target: WritableSignal<string>,
  timers: number[],
  characterDelay: number
): Promise<void> {
  target.set('');

  for (let index = 1; index <= text.length; index += 1) {
    await waitFor(timers, characterDelay);
    target.set(text.slice(0, index));
  }
}

export async function deleteTextFromSignal(
  target: WritableSignal<string>,
  timers: number[],
  characterDelay: number
): Promise<void> {
  const currentText = target();

  for (let index = currentText.length - 1; index >= 0; index -= 1) {
    await waitFor(timers, characterDelay);
    target.set(currentText.slice(0, index));
  }
}

export async function typeLinesToSignal(
  lines: string[],
  target: WritableSignal<string[]>,
  timers: number[],
  characterDelay: number,
  lineDelay = 28
): Promise<void> {
  target.set([]);

  for (const line of lines) {
    target.update((currentLines) => [...currentLines, '']);

    for (let index = 1; index <= line.length; index += 1) {
      await waitFor(timers, characterDelay);
      target.update((currentLines) => {
        const nextLines = [...currentLines];
        nextLines[nextLines.length - 1] = line.slice(0, index);
        return nextLines;
      });
    }

    await waitFor(timers, lineDelay);
  }
}
