import { AfterViewInit, Component, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { companySettings } from '../common/companyCustomization';
import { debounceTime, Subscription } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaqSectionComponent } from "../common/faq-section/faq-section.component";
import { CommonModule } from '@angular/common';
import { TextWithImageButtonComponent } from "../common/text-with-image-button/text-with-image-button.component";
import { ImageSliderComponent } from "../common/image-slider/image-slider.component";
import { MeasurementScaleComponent } from "../common/measurement-scale/measurement-scale.component";
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  imports: [MatFormFieldModule, ImageSliderComponent, ReactiveFormsModule, CommonModule, TextWithImageButtonComponent, MatIconModule, MatTooltipModule, FaqSectionComponent, MeasurementScaleComponent],
  templateUrl: './date-necklace-builder.component.html',
  styleUrl: './date-necklace-builder.component.scss'
})
export class DateNecklaceBuilderComponent implements OnInit, AfterViewInit, OnDestroy {
  public isDescriptionVisible: boolean = true;
  public isDetailsVisible: boolean = true;

  public formGroup = new FormGroup({
    quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
    metalColor: new FormControl('White Gold', Validators.required),
    metalCarat: new FormControl('10KT', Validators.required),
    diamondQuality: new FormControl('Natural VS', Validators.required),
    fontStyle: new FormControl('Regular', Validators.required),
    letterHeight: new FormControl('Medium', Validators.required),
    date: new FormControl('', this.endsWithDotValidator),
  });

  public mediaItems: string[] = [
    'assets/date-necklace/date_necklace_1.png',
    'assets/date-necklace/date_necklace_2.png',
    'assets/date-necklace/date_necklace_3.png',
    'assets/date-necklace/date_necklace_4.png',
    'assets/date-necklace/date_necklace_5.png'
  ];

  public metalColors = [
    { Name: 'White Gold', Icon: 'assets/metals/WhiteGold.jpg' },
    { Name: 'Yellow Gold', Icon: 'assets/metals/YellowGold.jpg' },
    { Name: 'Rose Gold', Icon: 'assets/metals/RoseGold.jpg' },
  ];
  public metalCarats = ['10KT', '14KT', '18KT'];
  public diamondQualities = ['Natural VS', 'Natural SI', 'Lab Grown'];
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
  public itemWidth: WritableSignal<number> = signal(0);
  public noOfDiamonds: WritableSignal<number> = signal(0);
  public caratWeight: WritableSignal<number> = signal(0);
  private subscription: Subscription = new Subscription();

  constructor() {
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.isEmbedded.set(window.self !== window.top);
    }

    this.subscription.add(
      this.formGroup.valueChanges
      .pipe(debounceTime(200))
      .subscribe(() => {
        this.formGroup.value.date?.length
          ? this.fetchData()
          : (() => {
            this.imageLoaded.set(false);
            this.itemPrice.set(0);
          })();
      })
    );
    
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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

  public get formValue() {
    return this.formGroup.getRawValue();
  }

  async fetchData(): Promise<void> {
    var metalColor = this.formGroup.value.metalColor === 'White Gold' ? 'Platinum' : this.formGroup.value.metalColor === 'Yellow Gold' ? 'Gold' : this.formGroup.value.metalColor;
    var diamondQuality = this.formGroup.value.diamondQuality === 'Natural VS' ? 'VS' : this.formGroup.value.diamondQuality === 'Natural SI' ? 'SI' : 'LAB';
    const url = `https://api.chandrajewellery.kenmarkserver.com/costing?quantity=${this.formGroup.value.quantity}&metalColor=${metalColor}&metalKarat=${this.formGroup.value.metalCarat}&DiamondQuality=${diamondQuality}&fontStyle=${this.formGroup.value.fontStyle}&letterHeight=${this.formGroup.value.letterHeight}&customName=${this.formGroup.value.date}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      const jsonResponse = await response.json();

      if (jsonResponse && jsonResponse.paths) {
        this.imageLoaded.set(true);
        this.chainImages.set(jsonResponse.chainImages);
        this.itemPrice.set(parseFloat((jsonResponse.price.necklacePrice * this.multiplier()).toFixed(2)));
        this.characterImages.set(jsonResponse.paths);
        this.itemWidth.set(jsonResponse.width);
        this.noOfDiamonds.set(jsonResponse.noOfDiamonds);
        this.caratWeight.set(jsonResponse.caratWeight);

      } else {
        this.imageLoaded.set(false);
        console.error('Failed to fetch paths or price data.');
      }
    } catch (error) {
      this.imageLoaded.set(false);
      console.error('Error fetching data: ', error);
    }
  }


  public buyAction(action: string) {
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
          { type: action, payload: cartData },
          '*'
        );
      }
    }
  }

  endsWithDotValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
  
    return value.endsWith('.') ? { endsWithDot: true } : null;
  }


  restrictInput(event: KeyboardEvent) {
    const inputChar = event.key;
    const currentValue = (event.target as HTMLInputElement).value;

    // Allow control keys
    if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(inputChar)) {
      return;
    }

    if(currentValue.length === 10) {
      event.preventDefault();
      return;
    }

    // Only digits and dot allowed
    if (!/[0-9.]/.test(inputChar)) {
      event.preventDefault();
      return;
    }

    // Prevent starting with dot
    if (inputChar === '.' && currentValue.length === 0) {
      event.preventDefault();
      return;
    }

    // Prevent more than 2 dots
    if (inputChar === '.' && (currentValue.match(/\./g) || []).length >= 2) {
      event.preventDefault();
      return;
    }

    // Optional: prevent consecutive dots
    if (inputChar === '.' && currentValue.endsWith('.')) {
      event.preventDefault();
      return;
    }
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
