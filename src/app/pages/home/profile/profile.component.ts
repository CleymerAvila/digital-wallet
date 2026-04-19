import { UserService } from 'src/app/core/services/user-service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { FireauthService } from 'src/app/core/services/fireauth-service';
import { take } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

  constructor(
    private modalCtrl: ModalController,
    private authService: FireauthService,
    private  userService :UserService,
    private router: Router,
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

  async saveChanges(): Promise<void>{
    this.userProfile$.pipe(take(1)).subscribe({
      next: (user) => {
        this.userService.update(user!.uid, this.updateForm.value);
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  async logout(): Promise<void> {
    this.close();
    await this.authService.logout();
    await this.router.navigate(['/auth/login'])
  }

}
