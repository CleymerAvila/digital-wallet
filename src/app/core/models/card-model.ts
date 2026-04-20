
export interface CreditCard {
  id: string;
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  balance: number;
  type: 'visa'  | 'mastercard';
  gradient: string[]
}
