import { CommonModule } from '@angular/common';
import { Component, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextWithImageButtonComponent } from "../common/text-with-image-button/text-with-image-button.component";
import { ImageSliderComponent } from "../common/image-slider/image-slider.component";
import { debounceTime } from 'rxjs';
import { companySettings } from '../common/companyCustomization';

@Component({
  selector: 'app-name-bracelet-builder',
  imports: [CommonModule, TextWithImageButtonComponent, ImageSliderComponent, ReactiveFormsModule],
  templateUrl: './name-bracelet-builder.component.html',
  styleUrl: './name-bracelet-builder.component.scss'
})
export class NameBraceletBuilderComponent {

  public mediaItems: string[] = [
    'assets/bracelet/bracelet_3.jpg',
    'assets/bracelet/bracelet_2.jpg',
    'assets/bracelet/bracelet_1.jpg',
    'assets/bracelet/bracelet_4.jpg',
    'assets/bracelet/bracelet_5.jpg',
    'assets/bracelet/bracelet-video.mp4',
  ];

    public formGroup = new FormGroup({
      quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
      metalColor: new FormControl('Rose Gold', Validators.required),
      metalCarat: new FormControl('10KT', Validators.required),
      diamondQuality: new FormControl('VS', Validators.required),
      fontStyle: new FormControl('Regular', Validators.required),
      letterHeight: new FormControl('Medium', Validators.required),
      customName: new FormControl('', [Validators.required, Validators.maxLength(10)]),
    });
    
    public metalColors = [
      { Name: 'Rose Gold', Icon: 'assets/metals/rose-gold-color.png' },
      { Name: 'Gold', Icon: 'assets/metals/gold-color.png' },
      { Name: 'Platinum', Icon: 'assets/metals/platinum-color.png' },
    ];
    public metalCarats = ['10KT', '14KT', '18KT'];
    public diamondQualities = ['VS', 'SI', 'LAB'];
    public fontStyles = ['Regular', 'Sport'];
    public letterHeights = ['Medium', 'Large'];

    public braceletImages: WritableSignal<string[]> = signal([]);
    public characterImages: WritableSignal<string[]> = signal([]);
    public itemPrice: WritableSignal<number> = signal(0);
    public imageLoaded: WritableSignal<boolean> = signal(false);
    public isEmbedded: WritableSignal<boolean> = signal(false);
    public themeColor: WritableSignal<string> = signal('#000000');
    public multiplier: WritableSignal<number> = signal(1);

    constructor(
    ) {
    }

    ngOnInit(): void {
      if (typeof window !== 'undefined') {
        this.isEmbedded.set(window.self !== window.top);
      }
      this.formGroup.valueChanges
        .pipe(debounceTime(200))
        .subscribe(() => {
          this.formGroup.value.customName?.length ? this.fetchData() : this.imageLoaded.set(false); this.itemPrice.set(0);
        });
    }

    ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const companyName = params.get("company");
      const settings = companyName ? companySettings[companyName] : companySettings['default'];
      this.themeColor.set(settings.theme);
      this.multiplier.set(settings.multiplier);
    }
    }
    
    public selectOption(field: string, value: string): void {
      this.formGroup.get(field)?.setValue(value);
    }
  
  
    async fetchData(): Promise<void> {
      const url = `https://chandrajewellery.api.ls2.kenmarkserver.com/costing?quantity=${this.formGroup.value.quantity}&metalColor=${this.formGroup.value.metalColor}&metalKarat=${this.formGroup.value.metalCarat}&DiamondQuality=${this.formGroup.value.diamondQuality}&fontStyle=${this.formGroup.value.fontStyle}&letterHeight=${this.formGroup.value.letterHeight}&customName=${this.formGroup.value.customName}`;
  
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
  
        const jsonResponse = await response.json();
  
        if (jsonResponse && jsonResponse.paths) {
          this.imageLoaded.set(true);
          this.braceletImages.set(jsonResponse.braceletImages);
          this.itemPrice.set(jsonResponse.price);
          this.characterImages.set(jsonResponse.paths);
  
        } else {
          this.imageLoaded.set(false);
          console.error('Failed to fetch paths or price data.');
        }
      } catch (error) {
        this.imageLoaded.set(false);
        console.error('Error fetching data: ', error);
      }
    }

    public addToCart() {
      if(this.isEmbedded()) {
        if (window.parent) {
          const cartData = {
            customName: this.formGroup.get('customName')?.value,
            quantity: this.formGroup.get('quantity')?.value,
            metalColor: this.formGroup.get('metalColor')?.value,
            metalCarat: this.formGroup.get('metalCarat')?.value,
            diamondQuality: this.formGroup.get('diamondQuality')?.value,
            fontStyle: this.formGroup.get('fontStyle')?.value,
            letterHeight: this.formGroup.get('letterHeight')?.value,
            itemPrice: this.itemPrice()
          };

          window.parent.postMessage(
            { type: 'ADD_TO_CART', payload: cartData },
            '*'
          );
        }
      }
    }

}
