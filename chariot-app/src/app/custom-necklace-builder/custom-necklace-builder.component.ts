import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { TextWithImageButtonComponent } from "../common/text-with-image-button/text-with-image-button.component";

@Component({
  selector: 'app-custom-necklace-builder',
  imports: [MatExpansionModule, CommonModule, ReactiveFormsModule, TextWithImageButtonComponent],
  templateUrl: './custom-necklace-builder.component.html',
  styleUrl: './custom-necklace-builder.component.scss'
})
export class CustomNecklaceBuilderComponent {

  public chainImages = [
    {
      Name: "Gold",
      Url: "assets/necklace-gold-template.png"
    },
    {
      Name: "Silver",
      Url: "assets/necklace-silver-template.png"
    },
    {
      Name: "Rose Gold",
      Url: "assets/necklace-rose-gold-template.png"
    }
  ];

  public metalColors = [
    { Name: 'Gold', Icon: 'assets/metals/Gold.jpg' },
    { Name: 'Rose Gold', Icon: 'assets/metals/RoseGold.jpg' },
    { Name: 'Platinum', Icon: 'assets/metals/Platinum.jpg' },
  ];
  public metalCarats = ['10KT', '14KT', '18KT'];
  public chainSizes = [14, 16, 18, 20];

  public selectedCharm: number | null = null;
  public assignedValue: string = '';
  public charmAssignments: { [key: number]: string } = {
    1: 'https://picsum.photos/50/50', //testing
  };

  public formGroup = new FormGroup({
    metalColor: new FormControl('Rose Gold', Validators.required),
    metalCarat: new FormControl('10KT', Validators.required),
    chainSize: new FormControl(14, Validators.required),
    numberOfCharms: new FormControl(null, [Validators.required, Validators.max(8)]),
  });

  public maxCharms: number = 8;
  public charms: number = 0;

  public createId(index: number) {
    if(index < this.charms/2) {
      return "charm-"+(this.charms - (2 * index + (this.charms % 2 ? 0 : 1))).toString();
    }
    else{
      return "charm-"+(2 * (index - (Math.ceil(this.charms/2))) + 2).toString();
    }
  }

  public getCharmsArray(): number[] {
    const length = this.formGroup.value.numberOfCharms ?? 0;
    return Array.from({ length }, (_, i) => i);
  }

  public getNumberArray(length: number): number[] {
    return Array.from({ length }, (_, index) => index);
  }

  public selectOption(field: string, value: string): void {
    this.formGroup.get(field)?.setValue(value);
  }

  public selectCharm(charm: number): void {
    this.selectedCharm = charm;
    this.assignedValue = this.charmAssignments[charm] || '';
  }

}
