import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup , Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { FireauthService } from 'src/app/core/services/fireauth-service';
import { ToastService } from 'src/app/core/services/toast-service';
import { UserService } from 'src/app/core/services/user-service';
import { UserCredential } from 'firebase/auth';
import { CreditCard } from 'src/app/core/models/card-model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.page.html',
  styleUrls: ['./add-card.page.scss'],
  standalone: false
})
export class AddCardPage implements OnInit {
name!: FormControl;
  cardHolderName!: FormControl;
  cardNumber!: FormControl;
  expiryDate!: FormControl;
  type!: FormControl;
  cvc!: FormControl;
  registerForm!: FormGroup;

  card: CreditCard = {
    id: '1',
    cardHolder: 'YOUR NAME',
    cardNumber: 'XXXX XXXX XXXX XXXX',
    expiryDate: 'MM/YY',
    balance: 2450.00,
    type: 'default',
    cvc: 124,
    gradient: ['#bdc3c7', '#2c3e50']
  }

  constructor(
    private userService: UserService,
    private toast: ToastService,
    private authService: FireauthService,
    private router: Router
  ) {
  }


  ngOnInit() {
    this.initForm();
    this.subscribeChanges();
  }

  initForm() {
    this.cardHolderName = new FormControl(this.card.cardHolder, Validators.required);
    this.cardNumber = new FormControl(this.card.cardNumber, Validators.required);
    this.expiryDate = new FormControl(this.card.expiryDate, Validators.required);
    this.type = new FormControl(this.card.type, Validators.required);
    this.cvc = new FormControl(this.card.cvc, Validators.required);


    this.registerForm = new FormGroup({
      cardHolderName: this.cardHolderName,
      cardNumber: this.cardNumber,
      expiryDate: this.expiryDate,
      type: this.type,
      cvc: this.cvc
    });
  }

  subscribeChanges(): void {
    this.registerForm.valueChanges.subscribe(newValues => {
      console.log("Formulario cambio: ", newValues);
      this.card = {
        ...this.card,
        cardHolder: newValues.cardHolderName || this.card.cardHolder,
        cardNumber: newValues.cardNumber || this.card.cardNumber,
        expiryDate: newValues.expiryDate || this.card.expiryDate,
        type: newValues.type || this.card.type,
        cvc: newValues.cvc || this.card.cvc
      }
    })
  }
  async onSubmit() {
    // await this.register(this.registerForm);
  }

  async register(form: any) {

  }

}
