import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore-service';
import { CreditCard } from '../models/card-model';
import { map, Observable } from 'rxjs';
import { orderBy, QueryConstraint, where } from 'firebase/firestore';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private readonly COL = 'cards';

  constructor(private db: FirestoreService) {}

  validateLuhn(cardNumber: string): boolean {
    // Limpiar el número (eliminar espacios y guiones)
    const cleanNumber = cardNumber.replace(/\D/g, '');

    if (!/^\d+$/.test(cleanNumber)) return false;

    let sum = 0;
    let shouldDouble = false;

    // Recorrer de derecha a izquierda
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i));

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit = digit - 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  getCardType(cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'discover' | 'default' {
    const cleanNumber = cardNumber.replace(/\D/g, '');

    // Patrones de identificación
    const patterns = {
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard: /^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/,
      amex: /^3[47][0-9]{13}$/,
      discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
    };

    if (patterns.visa.test(cleanNumber)) return 'visa';
    if (patterns.mastercard.test(cleanNumber)) return 'mastercard';
    if (patterns.amex.test(cleanNumber)) return 'amex';
    if (patterns.discover.test(cleanNumber)) return 'discover';

    return 'default';
  }

  creditCardValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      // Verificar si es válido según Luhn
      const isValidLuhn = this.validateLuhn(value);

      if (!isValidLuhn) {
        return { creditCard: 'Número de tarjeta inválido' };
      }

      return null;
    };
  }

  creditCardWithTypeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      // Validar Luhn
      const isValidLuhn = this.validateLuhn(value);

      if (!isValidLuhn) {
        return { creditCard: 'Número de tarjeta inválido' };
      }

      // Detectar tipo
      const cardType = this.getCardType(value);

      if (cardType === 'default') {
        return { cardType: 'Tipo de tarjeta no soportado' };
      }

      // Si es válido, puedes guardar el tipo como metadata
      return null;
    };
  }

  async create(userId: string, data: Partial<CreditCard>): Promise<string> {

      const cardId = this.generateCardId();
      const now = new Date();
      const newCard: CreditCard = {
        id: cardId,
        userId: userId,
        cardHolder: data.cardHolder || '',
        cardNumber: this.maskCardNumber(data.cardNumber || ''), // Guardar enmascarado
        expiryDate: data.expiryDate || '',
        balance: data.balance || 0,
        cvc: data.cvc || 0,
        type: data.type || 'default',
        gradient: this.getCardGradient(data.type ?? 'default'),
        isDefault: data.isDefault || false,
        createdAt: now,
        updatedAt: now,
        ...data
      };

      const userCards = await this.getUserCards(userId);
      if(userCards.length === 0 ){
        newCard.isDefault = true;
      }

      await this.db.set<CreditCard>(this.COL, cardId, newCard);

      return cardId;

    }

    async getUserCards(userId: string): Promise<CreditCard[]>{
      const constraints: QueryConstraint[] = [
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      ];
      return this.db.getAll<CreditCard>(this.COL, ...constraints);
    }

    listenUserCards$(userId: string): Observable<CreditCard[]> {
      const constraints : QueryConstraint[] = [
        where('userId', '==', userId),
        orderBy('isDefault', 'desc'),
        orderBy('createdAt', 'desc')
      ];
      return this.db.listenAll<CreditCard>(this.COL, ...constraints);
    }

    async getCardById(userId: string, cardId: string): Promise<CreditCard | null> {

      const card = await this.db.getById<CreditCard>(this.COL, cardId);

      if(card && card.userId === userId){
        return card;
      }

      return null;
    }

    listenCard$(userId: string, cardId: string): Observable<CreditCard | undefined> {
      return this.db.listen<CreditCard>(this.COL, cardId).pipe(
        map(card => {
          if(card && card.userId === userId){
            return card
          }
          return undefined
        })
      )
    }

    async updateCard(userId: string, cardId: string, data: Partial<CreditCard>): Promise<void> {

      const card = await this.db.getById(userId, cardId);
      if(!card){
        throw new Error('Tarjeta no encontrada o no autorizada');
      }

      const updateData = {
        ...data,
        updateAt: new Date()
      };

      if(updateData.isDefault){
        await this.setDefaultCard(userId, cardId);
      }

      await this.db.update<CreditCard>(this.COL, cardId, updateData);
    }

    async deleteCard(userId: string, cardId: string): Promise<void> {

      const card = await this.getCardById(userId, cardId);

      if(!card){
        throw new Error('Tarjeta no encontrada o no autorizada')
      }

      await this.db.delete(this.COL, cardId);

      if(card.isDefault){
        const userCards = await this.getUserCards(userId);
        if(userCards.length > 0){
          await this.setDefaultCard(userId, userCards[0].id);
        }
      }
    }

    async setDefaultCard(userId: string, defaultCardId: string): Promise<void> {
      const userCards = await this.getUserCards(userId);


      const updates = userCards.map(async (card) => {
        if(card.id === defaultCardId){
          if(!card.isDefault){
            await this.db.update<CreditCard>(this.COL, card.id, {
              isDefault: true,
              updatedAt: new Date()
            })
          }
        } else if(card.isDefault){
          await this.db.update<CreditCard>(this.COL, card.id, {
            isDefault: false,
            updatedAt: new Date
          })
        }
      })

      await Promise.all(updates);
    }

    private generateCardId(): string {
        return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private maskCardNumber(cardNumber: string): string {
        const cleanNumber = cardNumber.replace(/\s/g, '');
        const last4 = cleanNumber.slice(-4);
        return `**** **** **** ${last4}`;
    }

    async getDefaultCard(userId: string): Promise<CreditCard | null> {
        const constraints: QueryConstraint[] = [
            where('userId', '==', userId),
            where('isDefault', '==', true)
        ];
        const cards = await this.db.getAll<CreditCard>(this.COL, ...constraints);
        return cards.length > 0 ? cards[0] : null;
    }

    getCardGradient(cardType: string): string[] {
    switch(cardType) {
      case 'visa':
        return ['#1a1f71', '#1a1f71']; // Azul Visa
      case 'mastercard':
        return ['#eb001b', '#f79e1b']; // Rojo/Naranja Mastercard
      case 'amex':
        return ['#2e77bc', '#2e77bc']; // Azul American Express
      case 'discover':
        return ['#ff6000', '#ff6000']; // Naranja Discover
      default:
        return ['#667eea', '#764ba2']; // Gradiente por defecto
    }
  }
}
