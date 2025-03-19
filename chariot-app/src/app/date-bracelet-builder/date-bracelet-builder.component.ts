import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextWithImageButtonComponent } from "../common/text-with-image-button/text-with-image-button.component";
import { ImageSliderComponent } from "../common/image-slider/image-slider.component";
import { debounceTime } from 'rxjs';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-date-bracelet-builder',
  providers: [provideNativeDateAdapter()],
  imports: [
    MatFormFieldModule, 
    CommonModule, 
    TextWithImageButtonComponent, 
    ImageSliderComponent, 
    ReactiveFormsModule, 
    MatDatepickerModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatButtonModule
  ],
  templateUrl: './date-bracelet-builder.component.html',
  styleUrl: './date-bracelet-builder.component.scss'
})
export class DateBraceletBuilderComponent {

  public mediaItems: string[] = [
    'assets/bracelet/bracelet_1.jpg',
    'assets/bracelet/bracelet_2.jpg',
    'assets/bracelet/bracelet_3.jpg',
    'assets/bracelet/bracelet_4.jpg',
    'assets/bracelet/bracelet_5.jpg',
    'assets/bracelet/bracelet-video.mp4',
    'assets/bracelet/bracelet-video-2.mp4',
  ];

  public formGroup = new FormGroup({
    quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
    metalColor: new FormControl('Rose Gold', Validators.required),
    metalCarat: new FormControl('10KT', Validators.required),
    diamondQuality: new FormControl('VS', Validators.required),
    fontStyle: new FormControl('Regular', Validators.required),
    letterHeight: new FormControl('Medium', Validators.required),
    date: new FormControl('', [Validators.required, Validators.maxLength(10)]),
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

  public braceletImages: string[] = [];
  public characterImages: string[] = [];
  public letterHeight: string = '';
  public itemPrice: number = 0;
  public imageLoaded: boolean = false;
  public isEmbedded = false;
  private formattedDate: string | null = null;

  constructor(
    private router: Router
  ) {
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.isEmbedded = window.self !== window.top;
    }
    this.formGroup.valueChanges
      .pipe(debounceTime(200))
      .subscribe(() => {
        this.formGroup.value.date?.length ? this.fetchData() : this.imageLoaded = false;
      });
  }

  public selectOption(field: string, value: string): void {
    this.formGroup.get(field)?.setValue(value);
  }


  async fetchData(): Promise<void> {
    const url = `https://chandrajewellery.api.ls2.kenmarkserver.com/costing?quantity=${this.formGroup.value.quantity}&metalColor=${this.formGroup.value.metalColor}&metalKarat=${this.formGroup.value.metalCarat}&DiamondQuality=${this.formGroup.value.diamondQuality}&fontStyle=${this.formGroup.value.fontStyle}&letterHeight=${this.formGroup.value.letterHeight}&customName=${this.formattedDate}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      const jsonResponse = await response.json();

      if (jsonResponse && jsonResponse.paths) {
        this.imageLoaded = true;
        this.braceletImages = jsonResponse.braceletImages;
        this.itemPrice = jsonResponse.price;
        this.characterImages = jsonResponse.paths;

      } else {
        this.imageLoaded = true;
        console.error('Failed to fetch paths or price data.');
      }
    } catch (error) {
      this.imageLoaded = true;
      console.error('Error fetching data: ', error);
    }
  }

  public addToCart() {
    if (this.isEmbedded) {
      if (window.parent) {
        const cartData = {
          date: this.formGroup.get('date')?.value,
          quantity: this.formGroup.get('quantity')?.value,
          metalColor: this.formGroup.get('metalColor')?.value,
          metalCarat: this.formGroup.get('metalCarat')?.value,
          diamondQuality: this.formGroup.get('diamondQuality')?.value,
          fontStyle: this.formGroup.get('fontStyle')?.value,
          letterHeight: this.formGroup.get('letterHeight')?.value
        };

        window.parent.postMessage(
          { type: 'ADD_TO_CART', payload: cartData },
          '*'
        );
      }
    }
  }

  onDateChange(event: any): void {
    const selectedDate: Date = event.value;
    if (selectedDate) {
      this.formattedDate = this.formatDate(selectedDate);
    } else {
      this.formattedDate = null;
    }
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

}
