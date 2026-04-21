import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

export interface DialogOptions {
  header: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  placeholder?: string;
  inputType?: 'text' | 'number' | 'email' | 'password';
  confirmColor?: 'primary' | 'danger' | 'success' | 'warning';
  value?: string; // valor inicial
  min?: number; // para type number
  max?: number;
}

export interface InputDialogResult {
  confirmed: boolean;
  value: string | null;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private alertCtrl: AlertController) {}

  confirmInput(
    options: DialogOptions
  ): Promise<InputDialogResult> {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: options.header,
        message: options.message,
        inputs: [
          {
            type: options.inputType ?? 'text',
            placeholder: options.placeholder ?? 'Escribe aquí...',
            value: options.value ?? '',
            min: options.min,
            max: options.max,
            attributes: {
              autocomplete: 'off',
            },
          },
        ],
        buttons: [
          {
            text: options.cancelText ?? 'Cancelar',
            role: 'cancel',
            handler: () => resolve({ confirmed: false, value: '' }),
          },
          {
            text: options.confirmText ?? 'Aceptar',
            handler: (data) => {
              const value = data[0]?.trim() ?? '';
              if (!value) {
                // evita cerrar si está vacío
                return false;
              }
              resolve({ confirmed: true, value });
              return true;
            },
          },
        ],
      });

      await alert.present();
    });
  }

  confirm(options: DialogOptions): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: options.header,
        message: options.message,
        buttons: [
          {
            text: options.cancelText ?? 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false),
          },
          {
            text: options.confirmText ?? 'Aceptar',
            role: 'confirm',
            cssClass: options.confirmColor ?? 'primary',
            handler: () => resolve(true),
          },
        ],
      });

      await alert.present();
    });
  }

  confirmDelete(itemName: string = 'este elemento'): Promise<boolean> {
    return this.confirm({
      header: '¿Eliminar?',
      message: `¿Estás seguro que deseas eliminar ${itemName}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      confirmColor: 'danger',
    });
  }

  confirmLogout(): Promise<boolean> {
    return this.confirm({
      header: 'Cerrar sesión',
      message: '¿Estás seguro que deseas cerrar sesión?',
      confirmText: 'Cerrar sesión',
      cancelText: 'Cancelar',
      confirmColor: 'danger',
    });
  }

  confirmSave(): Promise<boolean> {
    return this.confirm({
      header: 'Guardar cambios',
      message: '¿Deseas guardar los cambios realizados?',
      confirmText: 'Guardar',
      cancelText: 'Descartar',
      confirmColor: 'primary',
    });
  }

  confirmSetDefault(itemName: string = 'este elemento'): Promise<boolean> {
    return this.confirm({
      header: 'Establecer predeterminado',
      message: `¿Deseas establecer ${itemName} como predeterminado?`,
      confirmText: 'Establecer',
      cancelText: 'Cancelar',
      confirmColor: 'success',
    });
  }
}
