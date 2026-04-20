import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup , Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { FireauthService } from 'src/app/core/services/fireauth-service';
import { ToastService } from 'src/app/core/services/toast-service';
import { UserService } from 'src/app/core/services/user-service';
import { CreditCard } from 'src/app/core/models/card-model';
import { CardService } from 'src/app/core/services/card-service';
@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.page.html',
  styleUrls: ['./add-card.page.scss'],
  standalone: false
})
export class AddCardPage implements OnInit {
name!: FormControl;
  cardHolder!: FormControl;
  cardNumber!: FormControl;
  expiryDate!: FormControl;
  type!: FormControl;
  cvc!: FormControl;
  registerForm!: FormGroup;

  card: CreditCard = {
    id: '1',
    userId: '',
    cardHolder: 'YOUR NAME',
    cardNumber: 'XXXX XXXX XXXX XXXX',
    expiryDate: 'MM/YY',
    isDefault: false,
    balance: 2450.00,
    type: 'default',
    cvc: 124,
    gradient: ['#bdc3c7', '#2c3e50'],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  constructor(
    private userService: UserService,
    private toast: ToastService,
    private authService: FireauthService,
    private cardService: CardService,
    private router: Router
  ) {
  }


  ngOnInit() {
    this.initForm();
    this.subscribeChanges();
  }

  initForm() {
    this.cardHolder = new FormControl(this.card.cardHolder, Validators.required);
    this.cardNumber = new FormControl(this.card.cardNumber, Validators.required);
    this.expiryDate = new FormControl(this.card.expiryDate, Validators.required);
    this.type = new FormControl(this.card.type, Validators.required);
    this.cvc = new FormControl(this.card.cvc, Validators.required);


    this.registerForm = new FormGroup({
      cardHolder: this.cardHolder,
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
    if(this.registerForm.valid){
      this.authService.currentUser$.subscribe(user => {
        try {
          const currentUserId = user?.uid;
          const data = this.registerForm.value;
          this.cardService.create(currentUserId!, data);
          this.toast.show('Tarjeta creada con exito!');
          console.log('Tarjeta creada con exito!');
        } catch(error: any) {
          this.toast.show('Error al crear tarjeta '+ error.message)
          console.error(error);
        }
      })
    }
  }

  async register(form: any) {

  }

}
