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

  async loginWithGoogle(): Promise<UserCredential>{
    if(this.platform.is('capacitor')){
      const result = await GoogleSignIn.signIn();
      const credential = GoogleAuthProvider.credential(result.idToken);
      return signInWithCredential(this.auth, credential);
    } else {
      const provider = new GoogleAuthProvider();
      return signInWithPopup(this.auth, provider);
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
