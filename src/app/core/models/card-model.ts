
export interface CreditCard {
  id: string;
  userId: string;
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  balance: number;
  cvc: number;
  type: 'visa'  | 'mastercard' | 'default';
  gradient: string[],
  isDefault?: boolean;  // Para tarjeta por defecto
  createdAt: Date;
  updatedAt: Date;
}
