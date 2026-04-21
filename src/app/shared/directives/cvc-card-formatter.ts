
import { Directive, HostListener } from '@angular/core';
import {  NgControl } from '@angular/forms'


@Directive({
  selector: '[appCvcCardFormatter]'
})
export class CvcCardFormatter {
  constructor(private ngControl: NgControl){

  }

  @HostListener('input', ['$event'])
  onInput(event: Event){
    const input  = event.target as HTMLInputElement;

    let value = input.value.replace(/\D/g, '')

    this.ngControl.control?.setValue(value, { emitEvent: false });

  }
}
