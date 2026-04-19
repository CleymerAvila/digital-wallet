import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserCredential } from 'firebase/auth';
import { FireauthService } from 'src/app/core/services/fireauth-service';
import { FirestoreService } from 'src/app/core/services/firestore-service';
import { ToastService } from 'src/app/core/services/toast-service';
@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
  standalone: false,
})
export class RegisterPageComponent implements OnInit {
  name!: FormControl;
  lastName!: FormControl;
  docType!: FormControl;
  docNumber!: FormControl;
  country!: FormControl;
  email!: FormControl;
  password!: FormControl;
  registerForm!: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private firestore: FirestoreService,
    private toast: ToastService,
    private authService: FireauthService,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit() {}

  initForm() {
    this.name = new FormControl('', Validators.required);
    this.lastName = new FormControl('', Validators.required);
    this.docType = new FormControl('', Validators.required);
    this.docNumber = new FormControl('', Validators.required);
    this.country = new FormControl('', Validators.required);
    this.email = new FormControl('', [Validators.required, Validators.email]);
    this.password = new FormControl('', [
      Validators.required,
      Validators.minLength(9),
      Validators.maxLength(12),
    ]);

    this.registerForm = new FormGroup({
      name: this.name,
      lastName: this.lastName,
      docType: this.docType,
      docNumber: this.docNumber,
      country: this.country,
      email: this.email,
      password: this.password,
    });
  }

  async onSubmit() {
    await this.register(this.registerForm.value);
  }

  async register(form: any) {

    this.authService.registerWithEmail(form.email, form.password)
    .subscribe({
      next: (userCredential: UserCredential) => {
        const user = userCredential.user;

       this.firestore.set('users', user.uid, {
        uid: user.uid,
        name: form.name,
        lastName: form.lastName,
        country: form.country,
        docType: form.docType,
        docNumber: form.docNumber,
        email: form.email,
        createAt: new Date(),
       });

       this.toast.show('Usuario registrado exitosamente');
       this.registerForm.reset();
       this.router.navigate(['/auth/login'])
      },
      error: (error) => {
        console.error("Error en el registro", error);
        this.toast.show(`Error al registrar: ${error.message} `);
        this.registerForm.reset();
      }
    })
  }
}
