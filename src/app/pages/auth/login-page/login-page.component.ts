import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { FireauthService } from 'src/app/core/services/fireauth-service';
import { ToastService } from 'src/app/core/services/toast-service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  standalone: false,
})
export class LoginPageComponent implements OnInit {
  email!: FormControl;
  password!: FormControl;
  loginForm!: FormGroup;

  router = inject(Router);
  constructor(
    private authService: FireauthService,
    private toast: ToastService,
  ) {
    this.email = new FormControl('', {
      validators: [Validators.required, Validators.email],
    });
    this.password = new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(12),
      ],
    });
    this.loginForm = new FormGroup({
      email: this.email,
      password: this.password,
    });
  }

  ngOnInit() {}

  onSubmit() {
    const emailValue = this.email.value;
    const passwordValue = this.password.value;

    this.authService.loginWithEmail(emailValue, passwordValue)
    .subscribe({
      next: () => {
        this.loginForm.reset();
        this.toast.show('Usuario Iniciado con exito')
        this.router.navigate(['/home'])
      },
      error: (error) => {
        this.toast.show(`Error al iniciar sesión ${error}`)
      }
    })
  }

  async signInWithGoogle(): Promise<void> {
    try {
      await this.authService.loginWithGoogle()
      this.toast.show('Inicio con google exitosamente');
      this.router.navigate(['/home'])
    } catch (error) {
      this.toast.show(`Error al iniciar con google ${error}`)
      throw error;
    }
  }

  async signInWithBiometric(): Promise<void> {
    try {
      await this.authService.loginWithBiometric();
      this.toast.show('Inicio con biometria exitoso');
      this.router.navigate(['/home']);
    } catch (error) {
      this.toast.show(`Eror al iniciar con biometrica ${error}`)
      throw error;
    }
  }
}
