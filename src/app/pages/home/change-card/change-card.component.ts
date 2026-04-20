import { CardService } from './../../../core/services/card-service';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { CreditCard } from 'src/app/core/models/card-model';
import { FireauthService } from 'src/app/core/services/fireauth-service';

@Component({
  selector: 'app-change-card',
  templateUrl: './change-card.component.html',
  styleUrls: ['./change-card.component.scss'],
  standalone: false,
})
export class ChangeCardComponent  implements OnInit {
  private currentUserId: string | undefined;
  cards$!: Observable<CreditCard[]>;
    constructor(
      private modalCtrl: ModalController,
      private cardService: CardService,
      private authService: FireauthService
    ) {
      this.authService.currentUser$.subscribe(user => {
        if(user) {
          this.currentUserId = user.uid;
          this.cards$ = this.cardService.listenUserCards$(this.currentUserId);
        }
      })
    }

  ngOnInit() {
  }

  dismiss(): void {
    this.modalCtrl.dismiss();
  }


  async onSelectedCard(event: any){
    console.log(event);
    await this.cardService?.setDefaultCard(this.currentUserId!, event.cardId);
  }

}
