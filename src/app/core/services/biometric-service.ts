import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core'
import { NativeBiometric, BiometryType } from 'capacitor-native-biometric'

export interface BiometricCredentials {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class BiometricService {
  private readonly SERVER_KEY = 'com.unicolombo.digital_wallet';

  async isAvailable(): Promise<{ available: boolean, isFaceId: boolean}> {
    if(!Capacitor.isNativePlatform()){
      return {available: false, isFaceId: false}
    }

    try {
      const result = await NativeBiometric.isAvailable();
      return {
        available: result.isAvailable,
        isFaceId: result.biometryType === BiometryType.FACE_ID,
      };
    } catch {
      return { available: false, isFaceId: false };
    }
  }


  async verify(): Promise<boolean> {
    try {
      await NativeBiometric.verifyIdentity({
        reason: 'Confirma tu identidad',
        title: 'Autenticación biométrica',
        subtitle: 'Usa tu huella o Face ID',
        description: 'Accede de forma segura a tu wallet',
        maxAttempts: 3,
        useFallback: true,
      });
      return true;
    } catch {
      return false;
    }
  }


  async saveCredentials(credentials: BiometricCredentials): Promise<void> {
    await NativeBiometric.setCredentials({
      username: credentials.username,
      password: credentials.password,
      server: this.SERVER_KEY,
    });
  }

  async getCredentials(): Promise<BiometricCredentials | null> {
    try {
      const result = await NativeBiometric.getCredentials({
        server: this.SERVER_KEY,
      });
      return { username: result.username, password: result.password };
    } catch {
      return null; // no hay credenciales guardadas
    }
  }

  async deleteCredentials(): Promise<void> {
    try {
      await NativeBiometric.deleteCredentials({server: this.SERVER_KEY});
    } catch (error) {

    }
  }

  async hasStoredCredentials(): Promise<boolean> {
    const credentials = await this.getCredentials();
    return !!credentials;
  }

  async loginWithBiometric(): Promise<BiometricCredentials | null> {
    const { available } =  await this.isAvailable();

    if(!available) return null;

    const verified = await this.verify();
    if(!verified) return null;

    return this.getCredentials();
  }
}
