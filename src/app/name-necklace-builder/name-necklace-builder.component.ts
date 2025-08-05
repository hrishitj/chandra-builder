import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageSliderComponent } from "../common/image-slider/image-slider.component";
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { debounceTime, forkJoin, map, Subscription, tap } from 'rxjs';
import { TextWithImageButtonComponent } from "../common/text-with-image-button/text-with-image-button.component";
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { companySettings } from '../common/companyCustomization';
import { FaqSectionComponent } from "../common/faq-section/faq-section.component";
import { MeasurementScaleComponent } from "../common/measurement-scale/measurement-scale.component";
import { ApiService } from '../services/api.service';
import { Codelist } from '../models/codelist';
import { CodelistPipe } from "../pipes/codelist.pipe";
import { CodelistWIthIcon } from '../models/codelistWithImage';

@Component({
  selector: 'app-name-necklace-builder',
  imports: [
    ImageSliderComponent,
    ReactiveFormsModule,
    CommonModule,
    TextWithImageButtonComponent,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule,
    FaqSectionComponent,
    MeasurementScaleComponent,
    CodelistPipe
],
  templateUrl: './name-necklace-builder.component.html',
  styleUrl: './name-necklace-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NameNecklaceBuilderComponent implements OnInit, AfterViewInit, OnDestroy {

  private apiService = inject(ApiService);
  public isSmallView = signal<boolean>(false);
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
  private subscription: Subscription = new Subscription();


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

    this.subscription.add(
      this.formGroup.valueChanges
        .pipe(debounceTime(200))
        .subscribe(() => {
          this.formGroup.value.customName?.length
            ? this.fetchData()
            : (() => {
              this.imageLoaded.set(false);
              this.itemPrice.set(0);
            })();
        })
    );


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

  public selectOption(field: string, value: number | string): void {
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
        this.formGroup.value.customName || ''
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
    if (this.isEmbedded()) {
      if (window.parent) {
        const cartData = {
          customName: this.formGroup.controls.customName?.value,
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

  public isCurvedLetter(firstLetter: boolean): boolean {
    if (!this.formGroup.get('customName')?.value || this.formGroup.get('customName')?.value?.length === 0) {
      return false;
    }
    const customName = this.formGroup.get('customName')?.value || '';
    let Letter = firstLetter ? customName.charAt(0) : customName.charAt(customName.length - 1);
    return firstLetter ? this.curvedLettersLeft.includes(Letter.toUpperCase()) : this.curvedLettersRight.includes(Letter.toUpperCase());
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