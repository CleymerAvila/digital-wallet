import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';
import { CardListComponent } from './components/card-list/card-list.component';
import { CreditCardComponent } from './components/credit-card/credit-card.component';



@NgModule({
  declarations: [CustomInputComponent, QuickActionsComponent, CardListComponent, CreditCardComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CustomInputComponent,
    QuickActionsComponent,
    CardListComponent,
    CreditCardComponent
  ]
})
export class SharedModule { }
