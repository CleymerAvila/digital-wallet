

import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appExpiryDateFormatter]'
})
export class ExpiryDateFormatter {

  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Eliminar no dígitos

    // Limitar a 4 dígitos (MMYY)
    if (value.length > 4) {
      value = value.slice(0, 4);
    }

    // Formatear como MM/YY
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }

    // Validar mes (01-12)
    if (value.length >= 2) {
      const month = parseInt(value.slice(0, 2));
      if (month > 12) {
        value = `12${value.slice(2)}`;
      } else if (month < 1 && value.length >= 2) {
        value = `01${value.slice(2)}`;
      }
    }

    this.ngControl.control?.setValue(value, { emitEvent: false });
  }

  @HostListener('blur', ['$event'])
  onBlur(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    // Validar fecha completa al salir
    if (input.value.length === 5) { // MM/YY
      const [month, year] = input.value.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      let isValid = true;
      let error = '';

      if (parseInt(month) < 1 || parseInt(month) > 12) {
        isValid = false;
        error = 'Mes inválido';
      }

      const expiryYear = parseInt(year);
      if (expiryYear < currentYear ||
          (expiryYear === currentYear && parseInt(month) < currentMonth)) {
        isValid = false;
        error = 'Tarjeta expirada';
      }

      if (!isValid) {
        this.ngControl.control?.setErrors({ expiryDate: error });
      }
    }
  }
}
