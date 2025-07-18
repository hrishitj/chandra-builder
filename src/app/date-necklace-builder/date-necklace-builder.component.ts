import { AfterViewInit, Component, inject, OnDestroy, OnInit, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { companySettings } from '../common/companyCustomization';
import { debounceTime, forkJoin, map, Subscription, tap } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaqSectionComponent } from "../common/faq-section/faq-section.component";
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TextWithImageButtonComponent } from "../common/text-with-image-button/text-with-image-button.component";
import { ImageSliderComponent } from "../common/image-slider/image-slider.component";
import { MeasurementScaleComponent } from "../common/measurement-scale/measurement-scale.component";
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Codelist } from '../models/codelist';
import { CodelistWIthIcon } from '../models/codelistWithImage';
import { ApiService } from '../services/api.service';
import { CodelistPipe } from "../pipes/codelist.pipe";

@Component({
  imports: [MatFormFieldModule, ImageSliderComponent, ReactiveFormsModule, CommonModule, TextWithImageButtonComponent, MatIconModule, MatTooltipModule, FaqSectionComponent, MeasurementScaleComponent, CodelistPipe],
  templateUrl: './date-necklace-builder.component.html',
  styleUrl: './date-necklace-builder.component.scss'
})
export class DateNecklaceBuilderComponent implements OnInit, AfterViewInit, OnDestroy {
  private apiService = inject(ApiService);
  
  public isDescriptionVisible: boolean = true;
  public isDetailsVisible: boolean = true;

  diamondQualities = signal<Codelist[]>([]);
  metalColors = signal<CodelistWIthIcon[]>([]);
  metalKarats = signal<Codelist[]>([]);
  fontStyles = signal<Codelist[]>([]);
  letterHeights = signal<Codelist[]>([]);

  public formGroup = new FormGroup({
    quantity: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
    metalColorId: new FormControl<number | null>(null, Validators.required),
    metalCaratId: new FormControl<number | null>(null, Validators.required),
    diamondQualityId: new FormControl<number | null>(null, Validators.required),
    fontStyleId: new FormControl<number | null>(null, Validators.required),
    letterHeightId: new FormControl<number | null>(null, Validators.required),
    date: new FormControl('', [Validators.required,this.endsWithDotValidator])
  });

  // public formGroup = new FormGroup({
  //   quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
  //   metalColor: new FormControl('White Gold', Validators.required),
  //   metalCarat: new FormControl('10KT', Validators.required),
  //   diamondQuality: new FormControl('Natural VS', Validators.required),
  //   fontStyle: new FormControl('Regular', Validators.required),
  //   letterHeight: new FormControl('Medium', Validators.required),
  //   date: new FormControl('', [
  //     Validators.required,
  //     this.endsWithDotValidator
  //   ])
  // });

  public mediaItems: string[] = [
    'assets/date-necklace/date_necklace_1.png',
    'assets/date-necklace/date_necklace_2.png',
    'assets/date-necklace/date_necklace_3.png',
    'assets/date-necklace/date_necklace_4.png',
    'assets/date-necklace/date_necklace_5.png'
  ];

  // public metalColors = [
  //   { Name: 'White Gold', Icon: 'assets/metals/WhiteGold.jpg' },
  //   { Name: 'Yellow Gold', Icon: 'assets/metals/YellowGold.jpg' },
  //   { Name: 'Rose Gold', Icon: 'assets/metals/RoseGold.jpg' },
  // ];
  // public metalCarats = ['10KT', '14KT', '18KT'];
  // public diamondQualities = ['Natural VS', 'Natural SI', 'Lab Grown'];
  // public fontStyles = ['Regular', 'Sport'];
  // public letterHeights = ['Medium', 'Large'];

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
  public isSmallView = signal<boolean>(false);

  private platformId = inject(PLATFORM_ID);
  private resizeListener!: () => void;

  private onResize(): void {
    this.checkWindowWidth();
  }

  private checkWindowWidth(): void {
    this.isSmallView.set(window.innerWidth - 200 < 800);
  }

  constructor() {
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.isEmbedded.set(window.self !== window.top);
    }

    forkJoin({
      diamondQualities: this.apiService.getDiamondQualities().pipe(map(data => data.filter(d => d.isActive))),
      metalColors: this.apiService.getMetalColors().pipe(map(data => data.filter(d => d.isActive))),
      metalKarats: this.apiService.getMetalKarats().pipe(map(data => data.filter(d => d.isActive))),
      fontStyles: this.apiService.getFontStyles().pipe(map(data => data.filter(d => d.isActive))),
      letterHeights: this.apiService.getLetterHeights().pipe(map(data => data.filter(d => d.isActive))),
    }).subscribe(({ diamondQualities, metalColors, metalKarats, fontStyles, letterHeights }) => {

      // Store for HTML dropdowns
      this.diamondQualities.set(diamondQualities);
      this.metalKarats.set(metalKarats);
      this.fontStyles.set(fontStyles);
      this.letterHeights.set(letterHeights);
      this.metalColors.set(metalColors.map(metalColor => ({
        ...metalColor,
        icon: this.getMetalIcon(metalColor.name)
      })));

      // Patch initial form values (select first by default)
      this.formGroup.patchValue({
        diamondQualityId: diamondQualities[0]?.id,
        metalColorId: metalColors[0]?.id,
        metalCaratId: metalKarats[0]?.id,
        fontStyleId: fontStyles[0]?.id,
        letterHeightId: letterHeights[0]?.id
      });
    });

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
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const companyName = params.get("company");
      const settings = companyName ? companySettings[companyName] : companySettings['default'];
      this.themeColor.set(settings.theme);
      this.multiplier.set(settings.multiplier);
    }

    if (isPlatformBrowser(this.platformId)) {
      this.checkWindowWidth(); // Initial check
      this.resizeListener = this.onResize.bind(this);
      window.addEventListener('resize', this.resizeListener);
    }
  }

  public selectOption(field: string, value: number): void {
    this.formGroup.get(field)?.setValue(value);
  }

  public get formValue() {
    return this.formGroup.getRawValue();
  }

  async fetchData(): Promise<void> {
    const formValue = this.formGroup.getRawValue();

    try {
      this.apiService.getCosting(
        formValue.quantity ?? 1,
        formValue.metalColorId?.toString() || '',
        formValue.metalCaratId?.toString() || '',
        formValue.diamondQualityId?.toString() || '',
        formValue.fontStyleId?.toString() || '',
        formValue.letterHeightId?.toString() || '',
        this.formGroup.value.date || ''
      ).pipe(
        tap(response => {
          if (response && response.paths) {
            this.imageLoaded.set(true);
            this.chainImages.set(response.chainImages);
            this.itemPrice.set(parseFloat((response.price.necklacePrice * this.multiplier()).toFixed(2)));
            this.characterImages.set(response.paths);
            this.itemWidth.set(response.width);
            this.noOfDiamonds.set(response.noOfDiamonds);
            this.caratWeight.set(response.caratWeight);

          } else {
            this.imageLoaded.set(false);
            console.error('Failed to fetch paths or price data.');
          }
        })
      ).subscribe();
    } catch (error) {
      this.imageLoaded.set(false);
      console.error('Error fetching data: ', error);
    }
  }


  public buyAction(action: string) {
    if(this.isEmbedded()) {
      if (window.parent) {
        const cartData = {
          customName: this.formGroup.get('date')?.value,
          quantity: this.formGroup.get('quantity')?.value,
          metalColor: this.formGroup.get('metalColorId')?.value,
          metalCarat: this.formGroup.get('metalCaratId')?.value,
          diamondQuality: this.formGroup.get('diamondQualityId')?.value,
          fontStyle: this.formGroup.get('fontStyleId')?.value,
          letterHeight: this.formGroup.get('letterHeightId')?.value,
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

  private getMetalIcon(name: string): string {
    const iconMap: Record<string, string> = {
      'White Gold': 'assets/metals/WhiteGold.jpg',
      'Yellow Gold': 'assets/metals/YellowGold.jpg',
      'Rose Gold': 'assets/metals/RoseGold.jpg'
    };

    return iconMap[name] || 'assets/metals/WhiteGold.jpg'; // fallback icon
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
