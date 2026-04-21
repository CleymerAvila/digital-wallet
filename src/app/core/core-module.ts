import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FireauthService } from './services/fireauth-service';
import { AlertController } from '@ionic/angular';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,

  ],
  providers: [
    FireauthService,
    AlertController
  ]
})
export class CoreModule { }
