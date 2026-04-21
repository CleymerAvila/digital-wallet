import { CreditCard } from './../../core/models/card-model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  AnimationController,
  ModalController,
  Animation,
} from '@ionic/angular';
import { FireauthService } from 'src/app/core/services/fireauth-service';
import { ToastService } from 'src/app/core/services/toast-service';
import { ProfileComponent } from './profile/profile.component';
import { ChangeCardComponent } from './change-card/change-card.component';
import { CreditCardComponent } from 'src/app/shared/components/credit-card/credit-card.component';
import { CardListComponent } from 'src/app/shared/components/card-list/card-list.component';
import { CardService } from 'src/app/core/services/card-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  currentUser$ = this.authService.currentUser$;
  cards$!: Observable<CreditCard[]>;
  @ViewChild('cardComponent') cardComponent!: CardListComponent;

  currentUserId: string = '';

  constructor(
    private authService: FireauthService,
    private cardService: CardService,
    private router: Router,
    private toast: ToastService,
    private modalController: ModalController,
    private animationCtrl: AnimationController
  ) {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUserId = user.uid;
        this.cards$ = this.cardService.listenUserCards$(this.currentUserId);
      }
    });
  }

  ngOnInit(): void {}

  ionViewDidEnter() {
    this.cardComponent?.triggerEntrance();
  }

  onEditCardCredit(e: any): void {
    console.log('Editar tarjeta:', e);
    // Implementar lógica de edición si es necesario
  }

  onDeleteCardCredit(e: any): void {
    console.log('Tarjeta eliminada:', e);
    this.toast.show('Tarjeta eliminada exitosamente');
  }

  async openChangeCardModal() {
    const enterAnimation = (baseEl: HTMLElement): Animation => {
      const root = baseEl.shadowRoot!;
      const backdropAnim = this.animationCtrl
        .create()
        .addElement(root.querySelector('ion-backdrop')!)
        .fromTo('opacity', '0.01', 'var(--backdrop-opacity');

      const wrapperAnim = this.animationCtrl
        .create()
        .addElement(root.querySelector('.modal-wrapper')!)
        .keyframes([
          { offset: 1, opacity: '0', transform: 'scale(0)' },
          { offset: 1, opacity: '1', transform: 'scale(1)' },
        ]);

      return this.animationCtrl
        .create()
        .addElement(baseEl)
        .easing('ease-out')
        .duration(300)
        .addAnimation([backdropAnim, wrapperAnim]);
    };

    const leaveAnimation = (baseEl: HTMLElement) => {
      return enterAnimation(baseEl).direction('reverse');
    };

    const modal = await this.modalController.create({
      component: ChangeCardComponent,
      enterAnimation,
      leaveAnimation,
      // Puedes pasar datos con componentProps:
      // componentProps: { titulo: 'Mi equipo' }
    });

    await modal.present();

    // Escuchar cuando se cierra
    const { data } = await modal.onDidDismiss();
    console.log('Modal cerrado con data:', data);
  }
  async openProfile() {
    const modal = await this.modalController.create({
      component: ProfileComponent,
      initialBreakpoint: 0.75,
      breakpoints: [0, 0.75, 1],
      handle: false,
    });
    modal.present();
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.toast.show('Sesión Cerrada exitosamente');
    this.router.navigate(['/auth/login']);
  }
}
