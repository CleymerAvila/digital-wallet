import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss'],
  standalone: false,
})
export class QuickActionsComponent  implements OnInit {
  @Input({required: true}) label!: string;
  @Input({required: true}) iconName!: string;
  @Input({required: true}) color!: string;

  constructor() { }

  ngOnInit() {}

}
