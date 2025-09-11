import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { TextWithImageButtonComponent } from "../common/text-with-image-button/text-with-image-button.component";
import { ImageSliderComponent } from "../common/image-slider/image-slider.component";
import { debounceTime, forkJoin, map, Subscription, tap } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FaqSectionComponent } from "../common/faq-section/faq-section.component";
import { companySettings } from '../common/companyCustomization';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MeasurementScaleComponent } from '../common/measurement-scale/measurement-scale.component';
import { Codelist } from '../models/codelist';
import { CodelistWIthIcon } from '../models/codelistWithImage';
import { ApiService } from '../services/api.service';
import { CodelistPipe } from "../pipes/codelist.pipe";

@Component({
  selector: 'app-date-bracelet-builder',
  providers: [],
  imports: [
    MatFormFieldModule,
    CommonModule,
    TextWithImageButtonComponent,
    ImageSliderComponent,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    FaqSectionComponent, MatTooltipModule, MatIconModule, MeasurementScaleComponent,
    CodelistPipe
],
  templateUrl: './date-bracelet-builder.component.html',
  styleUrl: './date-bracelet-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateBraceletBuilderComponent implements OnInit, OnDestroy, AfterViewInit {
  private apiService = inject(ApiService);

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
    date: new FormControl('', [Validators.required, this.endsWithDotValidator])
  });

  public mediaItems: string[] = [
    'assets/date-bracelet/date_bracelet_1.webp',
    'assets/date-bracelet/date_bracelet_2.webp',
    'assets/date-bracelet/date_bracelet_3.webp',
    'assets/date-bracelet/date_bracelet_4.webp',
    'assets/date-bracelet/date_bracelet_5.webp'
  ];

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
  private subscription: Subscription = new Subscription();

  public isDescriptionVisible: boolean = true;
  public isDetailsVisible: boolean = true;
  public isSmallView = signal<boolean>(false);

  private platformId = inject(PLATFORM_ID);
  private resizeListener!: () => void;

  private onResize(): void {
    this.checkWindowWidth();
  }

  private checkWindowWidth(): void {
    this.isSmallView.set(window.innerWidth - 200 < 800);
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.isEmbedded.set(window.self !== window.top);
    }

    this.subscription.add(
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
      })
    );

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
            this.braceletImages.set(response.braceletImages);
            this.itemPrice.set(parseFloat((response.price.braceletPrice * this.multiplier()).toFixed(2)));
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
    if (this.isEmbedded()) {
      if (window.parent) {
        const cartData = {
          customDate: this.formGroup.controls.date?.value,
          quantity: this.formGroup.controls.quantity?.value,
          metalColor: this.metalColors().find(c => c.id === this.formGroup.controls.metalColorId?.value)?.name,
          metalCarat: this.metalKarats().find(c => c.id === this.formGroup.controls.metalCaratId?.value)?.name,
          diamondQuality: this.diamondQualities().find(q => q.id === this.formGroup.controls.diamondQualityId?.value)?.name,
          fontStyle: this.fontStyles().find(f => f.id === this.formGroup.controls.fontStyleId?.value)?.name,
          letterHeight: this.letterHeights().find(h => h.id === this.formGroup.controls.letterHeightId?.value)?.name,
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

}
