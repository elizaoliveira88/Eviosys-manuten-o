import {Directive, ElementRef, Input} from '@angular/core';

@Directive({
  selector: "[element-focus]"
})
export class ElementFocusDirective {

  @Input("element-focus") set focusElement(focus: boolean) {

    if (focus) {
      setTimeout(() => {
        this.el.nativeElement.focus();
      },10);
    }
  }

  constructor(private el: ElementRef) { }
}
