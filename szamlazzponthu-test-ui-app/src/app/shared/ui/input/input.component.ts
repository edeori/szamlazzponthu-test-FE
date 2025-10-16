import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
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
        [disabled]="disabled"
        [attr.required]="required ? '' : null"
        [attr.minlength]="minlength ?? null"
        [attr.maxlength]="maxlength ?? null"
        [attr.pattern]="pattern ?? null"

        [value]="innerValue"
        (input)="handleInput($event)"
        (blur)="handleBlur()"
      />
    </label>
  `,
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor, Validator {
  /** Megjelenítés */
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'tel' = 'text';

  /** Validációs beállítások (külső template-ből adhatók) */
  @Input() required = false;
  @Input() minlength?: number;
  @Input() maxlength?: number;
  @Input() pattern?: string;

  @Input() model = '';
  @Output() modelChange = new EventEmitter<string>();

  /** Belső állapot a CVA-hoz */
  innerValue = '';
  disabled = false;

  private onChange: (v: string) => void = () => { };
  private onTouched: () => void = () => { };

  // ---- CVA ----
  writeValue(val: string | null): void {
    this.innerValue = (val ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(ev: Event) {
    const next = (ev.target as HTMLInputElement).value ?? '';
    this.innerValue = next;

    this.onChange(next);

    this.model = next;
    this.modelChange.emit(next);
  }

  handleBlur() {
    this.onTouched();
  }

  // ---- Validator ----
  validate(control: AbstractControl): ValidationErrors | null {
    const v = (control.value ?? '') as string;

    if (this.required && !v.trim()) {
      return { required: true };
    }
    if (this.minlength != null && v.length < this.minlength) {
      return { minlength: { requiredLength: this.minlength, actualLength: v.length } };
    }
    if (this.maxlength != null && v.length > this.maxlength) {
      return { maxlength: { requiredLength: this.maxlength, actualLength: v.length } };
    }
    if (this.pattern) {
      const re = new RegExp(this.pattern);
      if (!re.test(v)) {
        return { pattern: { requiredPattern: this.pattern, actualValue: v } };
      }
    }
    return null;
  }
}
