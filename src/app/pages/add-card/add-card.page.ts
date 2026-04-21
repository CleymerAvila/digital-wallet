import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup , Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { FireauthService } from 'src/app/core/services/fireauth-service';
import { ToastService } from 'src/app/core/services/toast-service';
import { UserService } from 'src/app/core/services/user-service';
import { CreditCard } from 'src/app/core/models/card-model';
import { CardService } from 'src/app/core/services/card-service';
import { Observable } from 'rxjs';
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
  detectedCardType: string = 'default';
  card$!: Observable<CreditCard>;

  cardPlaceHolder: CreditCard = {
    id: '1',
    userId: '',
    cardHolder: 'YOUR NAME',
    cardNumber: 'XXXX XXXX XXXX XXXX',
    expiryDate: 'MM/YY',
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
    this.setupCardTypeDetection();

    // this.logFormErrors();
  }

  logFormErrors() {
    // Ver estado general del formulario
    //console.log('Formulario válido:', this.registerForm?.valid);
    // console.log('Formulario errors:', this.registerForm?.errors);

    // Ver cada control individualmente
    if (this.registerForm) {
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        console.log(`${key}:`, {
          value: control?.value,
          valid: control?.valid,
          errors: control?.errors,
          touched: control?.touched,
          dirty: control?.dirty
        });
      });
    }
  }

  initForm() {
    this.cardHolder = new FormControl('', Validators.required);
    this.cardNumber = new FormControl(
      '', {
        validators: [
        Validators.required,
        Validators.minLength(14),
        this.cardService.creditCardValidator()
      ],
      // updateOn: 'blur'
    });
    this.expiryDate = new FormControl('', [
      Validators.required,
      Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)
    ]);
    this.type = new FormControl('default', Validators.required);
    this.cvc = new FormControl('', Validators.required);


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
      this.logFormErrors();
      this.cardPlaceHolder = {
        ...this.cardPlaceHolder,
        cardHolder: newValues.cardHolder || this.cardPlaceHolder.cardHolder,
        cardNumber: newValues.cardNumber || this.cardPlaceHolder.cardNumber,
        expiryDate: newValues.expiryDate || this.cardPlaceHolder.expiryDate,
        type: newValues.type || this.cardPlaceHolder.type,
        cvc: newValues.cvc || this.cardPlaceHolder.cvc
      }
    })

  }

  setupCardTypeDetection() {
    // Detectar tipo de tarjeta mientras escribe
    this.cardNumber.valueChanges.subscribe(value => {
      if (value && value.length >= 4) {
        this.detectedCardType = this.cardService.getCardType(value);

        // Actualizar el tipo en el formulario
        this.registerForm.patchValue({
          type: this.detectedCardType
        }, { emitEvent: false });

        // Actualizar gradiente de la tarjeta visual
        this.updateCardGradient();
      }

    });
  }

  updateCardGradient() {
    const gradient = this.cardService.getCardGradient(this.detectedCardType);
    this.cardPlaceHolder.gradient = gradient;
  }

  async onSubmit() {
    if(this.registerForm.valid){
      this.authService.currentUser$.subscribe(user => {
        try {
          const currentUserId = user?.uid;
          const data = this.registerForm.value;
          this.cardService.create(currentUserId!, data);
          this.toast.show('Tarjeta creada con exito!');
          this.registerForm.reset();
          this.router.navigate(['/home'])
          console.log('Tarjeta creada con exito!');
        } catch(error: any) {
          this.toast.show('Error al crear tarjeta '+ error.message)
          console.error(error);
        }
      })
    }
  }

}
