import { Injectable } from '@angular/core';

import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  user,
  UserCredential,
} from '@angular/fire/auth';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { Platform } from '@ionic/angular';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserService } from './user-service';
import { UserProfile } from '../models/user-model';
@Injectable({
  providedIn: 'root',
})
export class FireauthService {
  private firebaseUser$ = user(this.auth);

  currentUser$: Observable<UserProfile | null> = this.firebaseUser$.pipe(
    switchMap((firebaseUser) => {
      if (!firebaseUser) return of(null);
      return this.userService
        .listen$(firebaseUser.uid)
        .pipe(map((profile) => profile ?? null));
    })
  );

  constructor(
    private auth: Auth,
    private platform: Platform,
    private userService: UserService
  ) {
    this.initGoogleAuth();
  }

  private async initGoogleAuth(): Promise<void> {
    await GoogleSignIn.initialize({
      clientId: environment.googleWebClientId,
    });
  }

  async loginWithGoogle(): Promise<void> {
    try {
      let credential: UserCredential;

      if (this.platform.is('capacitor')) {
        const result = await GoogleSignIn.signIn();
        const googleCredential = GoogleAuthProvider.credential(result.idToken);
        credential = await signInWithCredential(this.auth, googleCredential);
      } else {
        const provider = new GoogleAuthProvider();
        credential = await signInWithPopup(this.auth, provider);
      }

      const exists = await this.userService.getById(credential.user.uid)!!;
      if (!exists) {
        await this.userService.create(credential.user.uid, {
          email: credential.user.email!,
          name: credential.user.displayName ?? '',
          photoURL: credential.user.photoURL ?? '',
        });
      }
    } catch (error: any) {
      // Muestra el error completo, no solo el mensaje
      console.error('Google Sign-In error completo:', JSON.stringify(error));
      console.error('Código:', error.code);
      console.error('Mensaje:', error.message);
    }
  }

  loginWithEmail(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  registerWithEmail(
    email: string,
    password: string
  ): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  async logout(): Promise<void> {
    if (this.platform.is('capacitor')) {
      await GoogleSignIn.signOut();
    }
    await signOut(this.auth);
  }

  get isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }
}
