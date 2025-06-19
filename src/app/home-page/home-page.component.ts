import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID, signal, AfterViewInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { companySettings } from '../common/companyCustomization';
import { MatDividerModule } from '@angular/material/divider';
import { FaqSectionComponent } from "../common/faq-section/faq-section.component";

@Component({
  selector: 'app-home-page',
  imports: [RouterModule, CommonModule, MatDividerModule, FaqSectionComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit, AfterViewInit, OnDestroy {

  public buildersData: { Img: string; MobileImg: string; Description: string; Url: string, queryParams: any }[] = [];
  public companySetting: { theme: string; multiplier: number; header: {img: string, description: string []} } = companySettings['default'];
  public headerDetails : { Img: string; Description: string;} = { Img: '', Description: ''};

  public isSmallView = signal<boolean>(false);

  private platformId = inject(PLATFORM_ID);
  private resizeListener!: () => void;

  private onResize(): void {
    this.checkWindowWidth();
  }

  private checkWindowWidth(): void {
    this.isSmallView.set(window.innerWidth < 451);
  }

  constructor(private route: ActivatedRoute) {}

  // public selectedTab: string = 'necklace'; // Default tab
  public necklaceImageTop: string = 'assets/home/necklace-header.jpg';
  public necklaceImageBottom: string = 'assets/home/necklace-bottom.jpg';
  public braceletImageTop: string = 'assets/home/bracelet-header.jpg'; 
  public braceletImageBottom: string = 'assets/home/bracelet-bottom.jpg';
  public mobileHeaderImage: string = 'assets/home/mobile-header.png';
  public mobileBottomImage: string = 'assets/home/mobile-bottom-image.jpg';

  // selectTab(tab: string) {
  //   this.selectedTab = tab;
  // }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {

      const companyName = params.get("company");
      const queryParams = companyName ? { company: companyName } : {};
      this.companySetting = companyName ? companySettings[companyName] : companySettings['default'];

      this.buildersData = [
        { Img: 'assets/home/block-name-necklace.png', MobileImg: 'assets/home/block-name-necklace-mobile.png', Description: 'Name Necklace', Url: `/name-necklace-builder`, queryParams },
        { Img: 'assets/home/date-necklace.png', MobileImg: 'assets/home/date-necklace-mobile.png', Description: 'Date Necklace', Url: `/date-necklace-builder`, queryParams },
        { Img: 'assets/home/block-name-bracelet.png', MobileImg: 'assets/home/block-name-bracelet-mobile.png', Description: 'Name Bracelet', Url: `/name-bracelet-builder`, queryParams },
        { Img: 'assets/home/date-bracelet.png', MobileImg: 'assets/home/date-bracelet-mobile.png', Description: 'Date Bracelet', Url: `/date-bracelet-builder`, queryParams }
      ];
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkWindowWidth(); // Initial check
      this.resizeListener = this.onResize.bind(this);
      window.addEventListener('resize', this.resizeListener);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }
}