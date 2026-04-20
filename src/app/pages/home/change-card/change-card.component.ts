import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CreditCard } from 'src/app/core/models/card-model';

@Component({
  selector: 'app-change-card',
  templateUrl: './change-card.component.html',
  styleUrls: ['./change-card.component.scss'],
  standalone: false,
})
export class ChangeCardComponent  implements OnInit {
    constructor(private modalCtrl: ModalController) {}

    cards: CreditCard[] = [
      {
        id: '1',
        cardHolder: 'Cesar Rodriguez',
        cardNumber: '4242424242424242',
        expiryDate: '12/27',
        balance: 2450.00,
        type: 'visa',
        gradient: ['#667eea', '#764ba2']
      },
      {
        id: '2',
        cardHolder: 'Cesar Rodriguez',
        cardNumber: '5353535353535353',
        expiryDate: '08/26',
        balance: 890.50,
        type: 'mastercard',
        gradient: ['#f093fb', '#f5576c']
      }
    ];
    dismiss(): void {
      this.modalCtrl.dismiss();
    }

  ngOnInit() {}

}
