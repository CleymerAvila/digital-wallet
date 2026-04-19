import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { FireauthService } from 'src/app/core/services/fireauth-service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: false,
})
export class ProfileComponent  implements OnInit {

  constructor(
    private modalCtrl: ModalController,
    private authService: FireauthService,
    private router: Router
  ) { }

  ngOnInit() {}

  close(): void {
    this.modalCtrl.dismiss();
  }

  async logout(): Promise<void> {
    this.close();
    await this.authService.logout();
    await this.router.navigate(['/auth/login'])
  }

}
