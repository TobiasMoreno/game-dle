import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'highlight', standalone: true })
export class HighlightPipe implements PipeTransform {
  transform(text: string, search: string): string {
    if (!search) return text;
    const re = new RegExp(`(${search})`, 'gi');
    return text.replace(re, '<span class="bg-yellow-200 text-black rounded px-1">$1</span>');
  }
} 