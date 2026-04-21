import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'creditCard',
  standalone: false,
})
export class CreditCardPipe implements PipeTransform {

  transform(value: string | number | null, showFull: boolean = false): string {
    if (!value) return '';

    let cardNumber = value.toString().replace(/\s/g, '');

    if (!showFull) {
      // Mostrar solo últimos 4 dígitos
      const last4 = cardNumber.slice(-4);
      return `**** **** **** ${last4}`;
    }

    // Mostrar completo con formato
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

}
