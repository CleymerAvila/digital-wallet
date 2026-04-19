import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(private platform: Platform) {}


  async ngOnInit(): Promise<void>{
    await this.platform.ready();
    await this.initializeApp();
  }

  private async initializeApp(): Promise<void> {

    await this.loadInitialData();

    await SplashScreen.hide({
      fadeOutDuration: 500
    });
  }

  private async loadInitialData(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}
