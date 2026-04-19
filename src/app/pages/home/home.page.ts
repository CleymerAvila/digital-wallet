import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FireauthService } from 'src/app/core/services/fireauth-service';
import { ToastService } from 'src/app/core/services/toast-service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  constructor(private authService: FireauthService, private router: Router, private toast: ToastService) {}

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.toast.show('Sesión Cerrada exitosamente')
    this.router.navigate(['/auth/login'])
  }

}
