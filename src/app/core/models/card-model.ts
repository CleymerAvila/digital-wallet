
export interface CreditCard {
  id: string;
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  balance: number;
  cvc: number;
  type: 'visa'  | 'mastercard' | 'default';
  gradient: string[]
}
