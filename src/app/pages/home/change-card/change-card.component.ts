import { CardService } from 'src/app/core/services/card-service';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { CreditCard } from 'src/app/core/models/card-model';
import { FireauthService } from 'src/app/core/services/fireauth-service';
import { ToastService } from 'src/app/core/services/toast-service';
import { Router } from '@angular/router';

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
      private authService: FireauthService,
      private cardService: CardService,
      private toastService: ToastService,
      private router: Router
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


  async onSetDefaultCard(event: any){
    await this.cardService.setDefaultCard(this.currentUserId!, event.id);
    this.toastService.show('Tarjeta seleccionada como predeterminada');
    this.modalCtrl.dismiss();
    this.router.navigate(['/home'])
  }

}
