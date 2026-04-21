import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddCardPageRoutingModule } from './add-card-routing.module';

import { AddCardPage } from './add-card.page';
import { SharedModule } from 'src/app/shared/shared-module';
import { CreditCardFormatter } from "src/app/shared/directives/credit-card-formatter";
import { ExpiryDateFormatter } from "src/app/shared/directives/expiry-date-formatter";
import { CvcCardFormatter } from "src/app/shared/directives/cvc-card-formatter";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    AddCardPageRoutingModule,
    CreditCardFormatter,
    ExpiryDateFormatter,
    CvcCardFormatter
],
  declarations: [AddCardPage]
})
export class AddCardPageModule {}
