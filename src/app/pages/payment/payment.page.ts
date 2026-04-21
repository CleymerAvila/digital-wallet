import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CreditCard } from 'src/app/core/models/card-model';
import { CardService } from 'src/app/core/services/card-service';
import { FireauthService } from 'src/app/core/services/fireauth-service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  standalone: false,
})
export class PaymentPage implements OnInit {

  card!: CreditCard | null;

  constructor(private cardService: CardService, private authService: FireauthService) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(async (user) => {
      if(user){
        this.card = await this.cardService.getDefaultCard(user.uid);
      }
    })
  }

}
