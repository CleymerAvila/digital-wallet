import { Component,Injector,Input, OnInit, Optional, Self, forwardRef } from '@angular/core';

import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl
} from '@angular/forms';


@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputComponent),
      multi: true
    }
  ]
})
export class CustomInputComponent   implements OnInit,  ControlValueAccessor {

  @Input() label: string = '';
  @Input() labelPlacement = '';
  @Input() fill = 'outline';
  @Input() type: string = 'text';
  @Input() icon: string = '';
  @Input() placeholder: string = '';
  @Input() errorMessages: Record<string, string> = {};

  value: any = '';
  isDisabled = false;
  control!: NgControl | null;
  constructor(private injector: Injector) {
  }

  ngOnInit(): void {

    try {
      this.control = this.injector.get(NgControl, null);

      if(this.control){
        this.control.valueAccessor = this;
      }
    } catch (error) {
      console.error("Error Custome Form", error)
    }
  }

  // funciones internas que Angular inyecta
  onChange: any = () => {};
  onTouched: any = () => {};

  // escribir valor desde el form
  writeValue(value: any): void {
    this.value = value ?? '';
  }

  // registrar cambio
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // registrar touched
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // estado disabled
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  // cuando el usuario escribe
  handleInput(event: any) {
    const value = event?.detail?.value ?? '';
    this.value = value;
    this.onChange(value);
  }

  // cuando pierde foco
  handleBlur() {
    this.onTouched();
  }

}
