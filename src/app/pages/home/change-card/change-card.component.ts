import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-change-card',
  templateUrl: './change-card.component.html',
  styleUrls: ['./change-card.component.scss'],
  standalone: false,
})
export class ChangeCardComponent  implements OnInit {

    constructor(private modalCtrl: ModalController) {}

    dismiss(): void {
      this.modalCtrl.dismiss();
    }

  ngOnInit() {}

}
