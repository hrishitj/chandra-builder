import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { companySettings } from '../common/companyCustomization';
import { MatDividerModule } from '@angular/material/divider';
import { FaqSectionComponent } from "../common/faq-section/faq-section.component";

@Component({
  selector: 'app-home-page',
  imports: [RouterModule, CommonModule, MatDividerModule, FaqSectionComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent implements OnInit {

  public buildersData: { Img: string; MobileImg: string; Description: string; Url: string, queryParams: any }[] = [];
  public companySetting: { theme: string; multiplier: number; header: {img: string, description: string []} } = companySettings['default'];

  constructor(private route: ActivatedRoute) {}

  // public selectedTab: string = 'necklace'; // Default tab
  public headerImage: string = 'assets/home/header.png';
  public footerImage: string = 'assets/home/footer.png';
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

}