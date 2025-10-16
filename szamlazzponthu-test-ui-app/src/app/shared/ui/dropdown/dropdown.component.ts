import { Component, Input, forwardRef } from '@angular/core';
import {
    FormsModule,
    NG_VALUE_ACCESSOR,
    ControlValueAccessor,
    NG_VALIDATORS,
    Validator,
    AbstractControl,
    ValidationErrors
} from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';

export type UiSelectOption = { value: string; label: string };

@Component({
    selector: 'ui-select',
    standalone: true,
    imports: [FormsModule, NgIf, NgFor],
    template: `
    <label class="field">
      <span *ngIf="label" class="label">{{ label }}</span>

      <select
        class="control dropdown"
        [attr.name]="name ?? null"
        [disabled]="disabled"
        [attr.required]="required ? '' : null"
        [ngModel]="innerValue"
        (ngModelChange)="onChangeValue($event)"
        (blur)="handleBlur()">

        <option *ngIf="placeholder" [ngValue]="''" disabled selected>
          {{ placeholder }}
        </option>

        <option *ngFor="let opt of _options" [ngValue]="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </label>
  `,
    styleUrls: ['./dropdown.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DropdownComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => DropdownComponent),
            multi: true,
        },
    ],
})
export class DropdownComponent implements ControlValueAccessor, Validator {
    @Input() label?: string;
    @Input() name?: string;
    @Input() placeholder?: string;
    @Input() required = false;
    @Input() disabled = false;

    public _options: UiSelectOption[] = [];
    @Input({ required: true })
    set options(value: UiSelectOption[] | null | undefined) {
        this._options = value ?? [];
    }

    // CVA belső érték
    innerValue = '';

    // CVA callbacks
    private onChange: (val: string) => void = () => { };
    private onTouched: () => void = () => { };

    // model -> view
    writeValue(value: string | null): void {
        this.innerValue = value ?? '';
    }

    // view -> model
    onChangeValue(next: string | null): void {
        const val = next ?? '';
        this.innerValue = val;
        this.onChange(val);
    }

    registerOnChange(fn: (val: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    handleBlur(): void {
        this.onTouched();
    }

    // Validator
    validate(_: AbstractControl): ValidationErrors | null {
        if (this.required && !this.innerValue) {
            return { required: true };
        }
        return null;
    }
}
