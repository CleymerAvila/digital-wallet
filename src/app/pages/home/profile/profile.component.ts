import { UserService } from 'src/app/core/services/user-service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { FireauthService } from 'src/app/core/services/fireauth-service';
import { take } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BiometricService } from 'src/app/core/services/biometric-service';
import { DialogService } from 'src/app/core/services/dialog-service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: false,
})
export class ProfileComponent  implements OnInit {
  userProfile$ = this.authService.currentUser$;
  updateForm: FormGroup;
  name: FormControl;
  lastName: FormControl;
  userEmail: string = '';

  constructor(
    private modalCtrl: ModalController,
    private authService: FireauthService,
    private  userService :UserService,
    private router: Router,
    private biometricService: BiometricService,
    private dialog: DialogService
  ) {
    this.name = new FormControl('', Validators.required);
    this.lastName = new FormControl('', Validators.required);
    this.updateForm = new FormGroup({name: this.name, lastName: this.lastName})
  }

  ngOnInit() {
    this.userProfile$.pipe(
      take(1)
    ).subscribe(user => {
      this.name.patchValue(user?.name ?? '')
      this.lastName.patchValue(user?.lastName ?? '');
    })
  }

  close(): void {
    this.modalCtrl.dismiss();
  }

  async isBiometricLockActive(): Promise<boolean> {
    return await this.biometricService.hasStoredCredentials();
  }

  async saveChanges(): Promise<void>{
    this.userProfile$.pipe(take(1)).subscribe({
      next: (user) => {
        if(user){
          this.userService.update(user!.uid, this.updateForm.value);
          this.userEmail = user.email;
        }
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  async toggleChanged(event: any){
    const biometricActive = event.detail.checked;
    const biometricDeactivate = event.detail.unchecked;

    if(biometricActive){
      const result= await this.dialog.confirmInput({
        header: 'Ingresar Contraseña',
        message: 'Ingresa tu Contraseña para activar autenticación biometrica',
        placeholder: 'contraseña',
        confirmText: 'Guardar',
      })

      if(!result.confirmed || !result.value) return;
      await this.biometricService.saveCredentials({username: this.userEmail, password:  result.value})
      return;
    }

    if(biometricDeactivate){
      const userVerified = await this.biometricService.verify();

      if(userVerified){
        const confirmed = await this.dialog.confirm({
            header: 'Confirmar',
            message: 'Estas seguro que desea eliminar la autenticación biometrica?',
        })
        if(confirmed){
          await this.biometricService.deleteCredentials();
        }
      }

    }
  }

  async logout(): Promise<void> {
    this.close();
    await this.authService.logout();
    await this.router.navigate(['/auth/login'])
  }

}
