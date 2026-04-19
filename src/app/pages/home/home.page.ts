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
