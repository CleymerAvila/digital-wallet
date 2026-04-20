import { CreditCard } from './../../core/models/card-model';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { FireauthService } from 'src/app/core/services/fireauth-service';
import { ToastService } from 'src/app/core/services/toast-service';
import { ProfileComponent } from './profile/profile.component';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  currentUser$ = this.authService.currentUser$;

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
    private modalController: ModalController
  ) {}

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
