import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageSliderComponent } from "../common/image-slider/image-slider.component";
import { CommonModule } from '@angular/common';
import { debounceTime } from 'rxjs';
import { TextWithImageButtonComponent } from "../common/text-with-image-button/text-with-image-button.component";
import { HttpClient } from '@angular/common/http';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { companySettings } from '../common/companyCustomization';

@Component({
  selector: 'app-name-necklace-builder',
  imports: [ImageSliderComponent, ReactiveFormsModule, CommonModule, TextWithImageButtonComponent, MatDividerModule, MatIconModule, MatTooltipModule ],
  providers: [HttpClient],
  templateUrl: './name-necklace-builder.component.html',
  styleUrl: './name-necklace-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NameNecklaceBuilderComponent implements OnInit, AfterViewInit{

  public isDescriptionVisible: boolean = true;
  public isDetailsVisible: boolean = true;

  public formGroup = new FormGroup({
    quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
    metalColor: new FormControl('Gold', Validators.required),
    metalCarat: new FormControl('10KT', Validators.required),
    diamondQuality: new FormControl('VS', Validators.required),
    fontStyle: new FormControl('Regular', Validators.required),
    letterHeight: new FormControl('Medium', Validators.required),
    customName: new FormControl('', [Validators.required, Validators.maxLength(10)]),
  });

  public mediaItems: string[] = [
    'assets/necklace/necklace_3.jpg',
    'assets/necklace/necklace_2.jpg',
    'assets/necklace/necklace_1.jpg',
    'assets/necklace/necklace_4.jpg',
    'assets/necklace/necklace-video.mp4',
  ];
  
  public metalColors = [
    { Name: 'Gold', Icon: 'assets/metals/Gold.jpg' },
    { Name: 'Rose Gold', Icon: 'assets/metals/RoseGold.jpg' },
    { Name: 'Platinum', Icon: 'assets/metals/Platinum.jpg' },
  ];
  public metalCarats = ['10KT', '14KT', '18KT'];
  public diamondQualities = ['VS', 'SI', 'LAB'];
  public fontStyles = ['Regular', 'Sport'];
  public letterHeights = ['Medium', 'Large'];

  public chainImages: WritableSignal<string[]> = signal([]);
  public characterImages: WritableSignal<string[]> = signal([]);
  public itemPrice: WritableSignal<number> = signal(0);
  public imageLoaded: WritableSignal<boolean> = signal(false);
  public isEmbedded: WritableSignal<boolean> = signal(false);
  public themeColor: WritableSignal<string> = signal('#000000');
  public multiplier: WritableSignal<number> = signal(1);
  public showPreview: WritableSignal<boolean> = signal(false);
  private curvedLettersLeft = ['A', 'C', 'G', 'J', 'O'];
  private curvedLettersRight = ['A', 'D', 'G', 'L', 'O'];


  constructor() {
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
        this.chainImages.set(jsonResponse.chainImages);
        this.itemPrice.set(parseFloat((jsonResponse.price * this.multiplier()).toFixed(2)));
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

  public isCurvedLetter(firstLetter: boolean): boolean {
    if(!this.formGroup.get('customName')?.value || this.formGroup.get('customName')?.value?.length === 0) {
      return false;
    }
    const customName = this.formGroup.get('customName')?.value || '';
    let Letter = firstLetter ? customName.charAt(0) : customName.charAt(customName.length - 1);
    return firstLetter ? this.curvedLettersLeft.includes(Letter.toUpperCase()) : this.curvedLettersRight.includes(Letter.toUpperCase());
  }

  faqs = [
    { question: "Do you offer resizing for necklaces or bracelets?", answer: "Yes, we offer resizing services for our bracelets and necklaces. Please contact our customer service team with your sizing request, and we’ll help you find the perfect fit.", open: false },
    { question: "Can I cancel or modify my order after it's been placed?", answer: "Once an order has been customized and processed, we are unable to modify or cancel it. However, please contact our customer service team as soon as possible if there are any issues, and we will assist you to the best of our ability.", open: false },
    { question: "What is your return/exchange policy?", answer: "As our jewelry is personalized, we do not accept returns or exchanges unless the item is damaged or defective. Please review your customization details carefully before completing your order. If there is an issue with your item, contact us, and we'll ensure a resolution.", open: false }
  ];

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }

  toggleAll() {
    const allOpen = this.faqs.every(faq => faq.open);
    this.faqs.forEach(faq => faq.open = !allOpen);
  }

  toggleDescription() {
    this.isDescriptionVisible = !this.isDescriptionVisible;
  }

  toggleDetails() {
    this.isDetailsVisible = !this.isDetailsVisible;
  }

  onPreviewClick() {
    this.showPreview.set(!this.showPreview());
  }

}