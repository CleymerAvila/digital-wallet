import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCreditCardFormatter]',
})
export class CreditCardFormatter {
  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s/g, '');

    // Solo permitir números
    value = value.replace(/\D/g, '');

    // Limitar a 16 dígitos
    if (value.length > 16) {
      value = value.slice(0, 16);
    }

    // Formatear con espacios cada 4 dígitos
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');

    // Actualizar el control sin disparar eventos en bucle
    this.ngControl.control?.setValue(formatted, { emitEvent: false });
  }

  @HostListener('blur', ['$event'])
  onBlur(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    // Limpiar espacios al salir del campo
    const cleanValue = input.value.replace(/\s/g, '');
    this.ngControl.control?.setValue(cleanValue, { emitEvent: false });
  }
}
