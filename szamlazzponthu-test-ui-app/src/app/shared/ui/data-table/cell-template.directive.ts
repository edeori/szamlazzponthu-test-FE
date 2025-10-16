import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[cell]'
})
export class CellTemplateDirective {
  @Input('cell') name!: string;
  constructor(public tpl: TemplateRef<any>) {}
}
