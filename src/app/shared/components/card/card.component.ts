import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {

  header = input(false);
  accionsheader = input(false);
  actions = input(false);
  hoverable = input(true);
  vacancy = input.required<any>();

  get image(): boolean {
    return (
      this.vacancy().logoCompany !== undefined &&
      this.vacancy().logoCompany !== ''
    );
  }
}
