import { CardComponent } from './../../shared/components/card/card.component';
import { CreditCard } from './../../core/models/card-model';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationController, ModalController, Animation } from '@ionic/angular';
import { FireauthService } from 'src/app/core/services/fireauth-service';
import { ToastService } from 'src/app/core/services/toast-service';
import { ProfileComponent } from './profile/profile.component';
import { ChangeCardComponent } from './change-card/change-card.component';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  currentUser$ = this.authService.currentUser$;
  @ViewChild('cardComponent') cardComponent!: CardComponent;

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
  constructor(
    private authService: FireauthService,
    private router: Router,
    private toast: ToastService,
    private modalController: ModalController,
    private animationCtrl: AnimationController
  ) {}

  ionViewDidEnter(){
    this.cardComponent?.triggerEntrance();
  }

  onEditCardCredit(e: any): void {

  }

  onDeleteCardCredit(e: any): void {

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
          { offset: 1, opacity: '1', transform: 'scale(1)' }
        ]);

      return this.animationCtrl
        .create()
        .addElement(baseEl)
        .easing('ease-out')
        .duration(300)
        .addAnimation([backdropAnim, wrapperAnim])
    }

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
      handle: false
    });
    modal.present();
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.toast.show('Sesión Cerrada exitosamente')
    this.router.navigate(['/auth/login'])
  }

}
