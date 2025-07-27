import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextWithImageButtonComponent } from "../common/text-with-image-button/text-with-image-button.component";
import { ImageSliderComponent } from "../common/image-slider/image-slider.component";
import { debounceTime, forkJoin, map, Subscription, tap } from 'rxjs';
import { companySettings } from '../common/companyCustomization';
import { FaqSectionComponent } from "../common/faq-section/faq-section.component";
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MeasurementScaleComponent } from "../common/measurement-scale/measurement-scale.component";
import { Codelist } from '../models/codelist';
import { CodelistWIthIcon } from '../models/codelistWithImage';
import { ApiService } from '../services/api.service';
import { CodelistPipe } from "../pipes/codelist.pipe";

@Component({
  selector: 'app-name-bracelet-builder',
  imports: [CommonModule, TextWithImageButtonComponent, ImageSliderComponent, ReactiveFormsModule, FaqSectionComponent, MatIconModule, MatTooltipModule, MeasurementScaleComponent, CodelistPipe],
  templateUrl: './name-bracelet-builder.component.html',
  styleUrl: './name-bracelet-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NameBraceletBuilderComponent implements OnInit, OnDestroy, AfterViewInit {
  private apiService = inject(ApiService);

  public mediaItems: string[] = [
    'assets/name-bracelet/name_bracelet_1.png',
    'assets/name-bracelet/name_bracelet_2.png',
    'assets/name-bracelet/name_bracelet_3.png',
    'assets/name-bracelet/name_bracelet_4.jpg',
    'assets/name-bracelet/name_bracelet_5.jpg',
    'assets/name-bracelet/name_bracelet_video.mp4',
  ];

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

  public braceletImages: WritableSignal<string[]> = signal([]);
  public characterImages: WritableSignal<string[]> = signal([]);
  public itemPrice: WritableSignal<number> = signal(0);
  public imageLoaded: WritableSignal<boolean> = signal(false);
  public isEmbedded: WritableSignal<boolean> = signal(false);
  public themeColor: WritableSignal<string> = signal('#000000');
  public multiplier: WritableSignal<number> = signal(1);
  public itemWidth: WritableSignal<number> = signal(0);
  public noOfDiamonds: WritableSignal<number> = signal(0);
  public caratWeight: WritableSignal<number> = signal(0);
  public showPreview: WritableSignal<boolean> = signal(false);
  public subscription: Subscription = new Subscription();

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
        this.formGroup.value.customName?.length
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
        this.formGroup.value.customName || ''
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
    } catch(error) {
      this.imageLoaded.set(false);
      console.error('Error fetching data: ', error);
    }
  };

  public buyAction(action: string) {
    if (this.isEmbedded()) {
      if (window.parent) {
        //TODO handle this
        const cartData = {
          customName: this.formGroup.get('customName')?.value,
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
