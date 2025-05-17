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
import { FaqSectionComponent } from "../common/faq-section/faq-section.component";
import { MeasurementScaleComponent } from "../common/measurement-scale/measurement-scale.component";

@Component({
  selector: 'app-name-necklace-builder',
  imports: [ImageSliderComponent, ReactiveFormsModule, CommonModule, TextWithImageButtonComponent, MatDividerModule, MatIconModule, MatTooltipModule, FaqSectionComponent, MeasurementScaleComponent],
  providers: [HttpClient],
  templateUrl: './name-necklace-builder.component.html',
  styleUrl: './name-necklace-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NameNecklaceBuilderComponent implements OnInit, AfterViewInit {

  public isDescriptionVisible: boolean = true;
  public isDetailsVisible: boolean = true;

  public formGroup = new FormGroup({
    quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
    metalColor: new FormControl('White Gold', Validators.required),
    metalCarat: new FormControl('10KT', Validators.required),
    diamondQuality: new FormControl('Natural VS', Validators.required),
    fontStyle: new FormControl('Regular', Validators.required),
    letterHeight: new FormControl('Medium', Validators.required),
    customName: new FormControl('', [Validators.required, Validators.maxLength(10)]),
  });

  public mediaItems: string[] = [
    'assets/name-necklace/name_necklace_1.png',
    'assets/name-necklace/name_necklace_2.png',
    'assets/name-necklace/name_necklace_3.png',
    'assets/name-necklace/name_necklace_4.jpg',
    'assets/name-necklace/name_necklace_5.jpg',
    'assets/name-necklace/name_necklace_video.mp4',
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
        this.formGroup.value.customName?.length
          ? this.fetchData()
          : (() => {
            this.imageLoaded.set(false);
            this.itemPrice.set(0);
          })();
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

  public get formValue() {
    return this.formGroup.getRawValue();
  }


  async fetchData(): Promise<void> {
    var metalColor = this.formGroup.value.metalColor === 'White Gold' ? 'Platinum' : this.formGroup.value.metalColor === 'Yellow Gold' ? 'Gold' : this.formGroup.value.metalColor;
    var diamondQuality = this.formGroup.value.diamondQuality === 'Natural VS' ? 'VS' : this.formGroup.value.diamondQuality === 'Natural SI' ? 'SI' : 'LAB';
    const url = `https://api.chandrajewellery.kenmarkserver.com/costing?quantity=${this.formGroup.value.quantity}&metalColor=${metalColor}&metalKarat=${this.formGroup.value.metalCarat}&DiamondQuality=${diamondQuality}&fontStyle=${this.formGroup.value.fontStyle}&letterHeight=${this.formGroup.value.letterHeight}&customName=${this.formGroup.value.customName}`;

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

  public isCurvedLetter(firstLetter: boolean): boolean {
    if (!this.formGroup.get('customName')?.value || this.formGroup.get('customName')?.value?.length === 0) {
      return false;
    }
    const customName = this.formGroup.get('customName')?.value || '';
    let Letter = firstLetter ? customName.charAt(0) : customName.charAt(customName.length - 1);
    return firstLetter ? this.curvedLettersLeft.includes(Letter.toUpperCase()) : this.curvedLettersRight.includes(Letter.toUpperCase());
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