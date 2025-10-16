// src/app/shared/ui/input/input.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <label class="field">
      <span *ngIf="label" class="label">{{ label }}</span>
      <input
        class="control"
        [type]="type"
        [placeholder]="placeholder"
        [ngModel]="model"
        (ngModelChange)="onModelChange($event)" />
    </label>
  `,
  styleUrls: ['./input.component.scss']
})
export class InputComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text'|'email'|'password'|'tel' = 'text';

  /** A kétirányú kötés első fele */
  @Input() model = '';

  /** A kétirányú kötés második fele (banana-in-a-box: [(model)]) */
  @Output() modelChange = new EventEmitter<string>();

  onModelChange(value: string) {
    this.model = value;
    this.modelChange.emit(value);
  }
}
