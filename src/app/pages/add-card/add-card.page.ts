import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup , Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { FireauthService } from 'src/app/core/services/fireauth-service';
import { ToastService } from 'src/app/core/services/toast-service';
import { UserService } from 'src/app/core/services/user-service';
import { UserCredential } from 'firebase/auth';
import { CreditCard } from 'src/app/core/models/card-model';

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



  constructor(
    private userService: UserService,
    private toast: ToastService,
    private authService: FireauthService,
    private router: Router
  ) {
    this.initForm();
  }

  cards: CreditCard[] = [
    {
      id: '1',
      cardHolder: 'Cesar Rodriguez',
      cardNumber: '4242424242424242',
      expiryDate: '12/27',
      balance: 2450.00,
      type: 'visa',
      gradient: ['#667eea', '#764ba2']
    },
    {
      id: '2',
      cardHolder: 'Cesar Rodriguez',
      cardNumber: '5353535353535353',
      expiryDate: '08/26',
      balance: 890.50,
      type: 'mastercard',
      gradient: ['#f093fb', '#f5576c']
    }
  ];
  ngOnInit() {}

  initForm() {
    this.cardHolderName = new FormControl('', Validators.required);
    this.cardNumber = new FormControl('', Validators.required);
    this.expiryDate = new FormControl('', Validators.required);
    this.type = new FormControl('', Validators.required);
    this.cvc = new FormControl('', Validators.required);


    this.registerForm = new FormGroup({
      cardHolderName: this.cardHolderName,
      cardNumber: this.cardNumber,
      expiryDate: this.expiryDate,
      type: this.type,
      cvc: this.cvc
    });
  }

  async onSubmit() {
    await this.register(this.registerForm);
  }

  async register(form: any) {

    const email = form.value.email;
    const password = form.value.password;
    form.removeControl('password')

    const formWithoutPassword = form.value;

    this.authService.registerWithEmail(email, password)
    .subscribe({
      next: (userCredential: UserCredential) => {
        const user = userCredential.user;

        // form.password =

       this.userService.create(user.uid, formWithoutPassword);
       this.toast.show('Usuario registrado exitosamente');
       this.registerForm.reset();
       this.router.navigate(['/home'])
      },
      error: (error) => {
        console.error("Error en el registro", error);
        this.toast.show(`Error al registrar: ${error.message} `);
        this.registerForm.reset();
      }
    })
  }

}
