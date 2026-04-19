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
  UserCredential
}
from '@angular/fire/auth'
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { Platform } from '@ionic/angular';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class FireauthService {

  currentUser$ = user(this.auth);

  constructor(private auth: Auth, private platform: Platform){
    this.initGoogleAuth();
  }

  private async initGoogleAuth(): Promise<void> {
    await GoogleSignIn.initialize({
      clientId: environment.googleWebClientId
    })
  }

  async loginWithGoogle(): Promise<void>{
    try {

      if(this.platform.is('capacitor')){
        const result = await GoogleSignIn.signIn();
        console.log('Google result: ', result)
        const credential = GoogleAuthProvider.credential(result.idToken);
        await signInWithCredential(this.auth, credential);
      } else {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(this.auth, provider);
      }
    } catch (error: any) {
      // Muestra el error completo, no solo el mensaje
      console.error('Google Sign-In error completo:', JSON.stringify(error));
      console.error('Código:', error.code);
      console.error('Mensaje:', error.message);
    }
  }

  loginWithEmail(email: string, password: string):
                Observable<UserCredential> {
    return from(signInWithEmailAndPassword(
      this.auth, email, password
    ));
  }

  registerWithEmail(email: string, password: string):
                Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(
      this.auth, email, password
    ))
  }

  async logout(): Promise<void>{
    if(this.platform.is('capacitor')){
      await GoogleSignIn.signOut();
    }
    await signOut(this.auth);
  }

  get isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }
}
