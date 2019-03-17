import { Component, Input } from '@angular/core';

@Component({
  selector: 'loading-dots',
  template: `
    <div class="text-center">
      <span class="loading-dot loading-dot-1{{size ? (' loading-dot-' + size) : ''}}"></span>
      <span class="loading-dot loading-dot-2{{size ? (' loading-dot-' + size) : ''}}"></span>
      <span class="loading-dot loading-dot-3{{size ? (' loading-dot-' + size) : ''}}"></span>
    </div>
    <div class="text-center loading-text {{size ? (' loading-text-' + size) : ''}}">Loading</div>
  `
})
export class LoadingDotsComponent {

  @Input() size?: 'lg' | 'sm';

}