import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FireauthService } from 'src/app/core/services/fireauth-service';
import { ToastService } from 'src/app/core/services/toast-service';
import { CreditCard } from 'src/app/core/models/card-model';
import { CardService } from 'src/app/core/services/card-service';
@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.page.html',
  styleUrls: ['./add-card.page.scss'],
  standalone: false,
})
export class AddCardPage implements OnInit {
  currentUserId!: string | undefined;
  isUpdatingMode: boolean = false;
  name!: FormControl;
  cardId: string | null = null;
  cardHolder!: FormControl;
  cardNumber!: FormControl;
  expiryDate!: FormControl;
  type!: FormControl;
  cvc!: FormControl;
  registerForm!: FormGroup;
  detectedCardType: string = 'default';
  card: CreditCard | null = null;

  cardPlaceHolder: CreditCard = {
    id: '1',
    userId: '',
    cardHolder: 'YOUR NAME',
    cardNumber: 'XXXX XXXX XXXX XXXX',
    expiryDate: 'MM/YY',
    balance: 2450.0,
    type: 'default',
    cvc: 124,
    gradient: ['#bdc3c7', '#2c3e50'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  constructor(
    private toast: ToastService,
    private authService: FireauthService,
    private cardService: CardService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUserId = user?.uid;
      this.route.paramMap.subscribe((params) => {
        this.cardId = params.get('id');
        if (this.cardId) {
          this.isUpdatingMode = true;
          this.loadCardData(this.cardId);
        }
      });
    });

    this.initForm();
    this.subscribeChanges();
    this.setupCardTypeDetection();
    // this.logFormErrors();
  }

  loadCardData(id: string) {
    this.cardService.getCardById(this.currentUserId!, id).then((card) => {
      this.card = card;
      if (this.card) {
        this.registerForm.patchValue(this.card);
      }
    });
  }

  logFormErrors() {
    // Ver estado general del formulario
    //console.log('Formulario válido:', this.registerForm?.valid);
    // console.log('Formulario errors:', this.registerForm?.errors);

    // Ver cada control individualmente
    if (this.registerForm) {
      Object.keys(this.registerForm.controls).forEach((key) => {
        const control = this.registerForm.get(key);
        console.log(`${key}:`, {
          value: control?.value,
          valid: control?.valid,
          errors: control?.errors,
          touched: control?.touched,
          dirty: control?.dirty,
        });
      });
    }
  }

  initForm() {
    this.cardHolder = new FormControl('', Validators.required);
    this.cardNumber = new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(14),
        this.cardService.creditCardValidator(),
      ],
      // updateOn: 'blur'
    });
    this.expiryDate = new FormControl('', [
      Validators.required,
      Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/),
    ]);
    this.type = new FormControl('default', Validators.required);
    this.cvc = new FormControl('', Validators.required);

    this.registerForm = new FormGroup({
      cardHolder: this.cardHolder,
      cardNumber: this.cardNumber,
      expiryDate: this.expiryDate,
      type: this.type,
      cvc: this.cvc,
    });
  }

  subscribeChanges(): void {
    this.registerForm.valueChanges.subscribe((newValues) => {
      console.log('Formulario cambio: ', newValues);
      // this.logFormErrors();
      if (this.isUpdatingMode && this.card) {
        this.card = {
          ...this.card,
          cardHolder: newValues.cardHolder || this.card?.cardHolder,
          cardNumber: newValues.cardNumber || this.card?.cardNumber,
          expiryDate: newValues.expiryDate || this.card?.expiryDate,
          type: newValues.type || this.card?.type,
          cvc: newValues.cvc || this.card?.cvc,
        };
      } else {
        this.cardPlaceHolder = {
          ...this.cardPlaceHolder,
          cardHolder: newValues.cardHolder || this.cardPlaceHolder.cardHolder,
          cardNumber: newValues.cardNumber || this.cardPlaceHolder.cardNumber,
          expiryDate: newValues.expiryDate || this.cardPlaceHolder.expiryDate,
          type: newValues.type || this.cardPlaceHolder.type,
          cvc: newValues.cvc || this.cardPlaceHolder.cvc,
        };
      }
    });
  }

  setupCardTypeDetection() {
    // Detectar tipo de tarjeta mientras escribe
    this.cardNumber.valueChanges.subscribe((value) => {
      if (value && value.length >= 4) {
        this.detectedCardType = this.cardService.getCardType(value);

        // Actualizar el tipo en el formulario
        this.registerForm.patchValue(
          {
            type: this.detectedCardType,
          },
          { emitEvent: false }
        );

        // Actualizar gradiente de la tarjeta visual
        this.updateCardGradient();
      }
    });
  }

  updateCardGradient() {
    const gradient = this.cardService.getCardGradient(this.detectedCardType);
    if(this.isUpdatingMode && this.card){
      this.card.gradient = gradient;
      return;
    } else {
      this.cardPlaceHolder.gradient = gradient;
    }
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.authService.currentUser$.subscribe((user) => {
        try {
          const currentUserId = user?.uid;
          const data = this.registerForm.value;
          if(!this.isUpdatingMode){
            this.cardService.create(currentUserId!, data);
            this.toast.show('Tarjeta creada con exito!');
          } else {
            if(this.card)
            this.cardService.updateCard(currentUserId!, this.card.id, data);
            this.toast.show('Tarjeta Actualizada con exito');
            this.isUpdatingMode = false;
          }
          this.registerForm.reset();
          this.router.navigate(['/home']);
        } catch (error: any) {
          this.toast.show('Error al crear tarjeta ' + error.message);
          console.error(error);
        }
      });
    }
  }
}
