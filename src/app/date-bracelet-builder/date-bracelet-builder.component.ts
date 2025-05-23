import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { TextWithImageButtonComponent } from "../common/text-with-image-button/text-with-image-button.component";
import { ImageSliderComponent } from "../common/image-slider/image-slider.component";
import { debounceTime, Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FaqSectionComponent } from "../common/faq-section/faq-section.component";
import { companySettings } from '../common/companyCustomization';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MeasurementScaleComponent } from '../common/measurement-scale/measurement-scale.component';

@Component({
  selector: 'app-date-bracelet-builder',
  providers: [],
  imports: [
    MatFormFieldModule,
    CommonModule,
    TextWithImageButtonComponent,
    ImageSliderComponent,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    FaqSectionComponent, MatTooltipModule, MatIconModule, MeasurementScaleComponent
  ],
  templateUrl: './date-bracelet-builder.component.html',
  styleUrl: './date-bracelet-builder.component.scss'
})
export class DateBraceletBuilderComponent implements OnInit, OnDestroy, AfterViewInit {

  public mediaItems: string[] = [
    'assets/date-bracelet/date_bracelet_1.png',
    'assets/date-bracelet/date_bracelet_2.png',
    'assets/date-bracelet/date_bracelet_3.png',
    'assets/date-bracelet/date_bracelet_4.png',
    'assets/date-bracelet/date_bracelet_5.png'
  ];

  public formGroup = new FormGroup({
    quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
    metalColor: new FormControl('White Gold', Validators.required),
    metalCarat: new FormControl('10KT', Validators.required),
    diamondQuality: new FormControl('VS', Validators.required),
    fontStyle: new FormControl('Regular', Validators.required),
    letterHeight: new FormControl('Medium', Validators.required),
    date: new FormControl('', this.endsWithDotValidator),
  });

  public metalColors = [
    { Name: 'White Gold', Icon: 'assets/metals/WhiteGold.jpg' },
    { Name: 'Yellow Gold', Icon: 'assets/metals/YellowGold.jpg' },
    { Name: 'Rose Gold', Icon: 'assets/metals/RoseGold.jpg' },
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
  public showPreview: WritableSignal<boolean> = signal(false);
  public itemWidth: WritableSignal<number> = signal(0);
  public noOfDiamonds: WritableSignal<number> = signal(0);
  public caratWeight: WritableSignal<number> = signal(0);
  private formattedDate: string | null = null;
  private subscription: Subscription = new Subscription();

  public isDescriptionVisible: boolean = true;
  public isDetailsVisible: boolean = true;

  constructor(
  ) {
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.isEmbedded.set(window.self !== window.top);
    }
    this.subscription.add(this.formGroup.valueChanges
      .pipe(debounceTime(200))
      .subscribe(() => {
        this.formGroup.value.date?.length
          ? this.fetchData()
          : (() => {
            this.imageLoaded.set(false);
            this.itemPrice.set(0);
          })();
      }));
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


  async fetchData(): Promise<void> {

    var metalColor = this.formGroup.value.metalColor === 'White Gold' ? 'Platinum' : this.formGroup.value.metalColor === 'Yellow Gold' ? 'Gold' : this.formGroup.value.metalColor;
    const url = `https://api.chandrajewellery.kenmarkserver.com/costing?quantity=${this.formGroup.value.quantity}&metalColor=${metalColor}&metalKarat=${this.formGroup.value.metalCarat}&DiamondQuality=${this.formGroup.value.diamondQuality}&fontStyle=${this.formGroup.value.fontStyle}&letterHeight=${this.formGroup.value.letterHeight}&customName=${this.formGroup.value.date}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      const jsonResponse = await response.json();

      if (jsonResponse && jsonResponse.paths) {
        this.imageLoaded.set(true);
        this.braceletImages.set(jsonResponse.braceletImages);
        this.itemPrice.set(parseFloat((jsonResponse.price.braceletPrice * this.multiplier()).toFixed(2)));
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
    if (this.isEmbedded()) {
      if (window.parent) {
        const cartData = {
          customName: this.formattedDate,
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

    if (currentValue.length === 10) {
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

  public get formValue() {
    return this.formGroup.getRawValue();
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
