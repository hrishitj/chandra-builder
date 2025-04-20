import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
export class HomePageComponent implements OnInit {

  public buildersData: { Img: string; Description: string; Url: string, queryParams: any }[] = [];
  public companySetting: { theme: string; multiplier: number; header: {img: string, description: string []} } = companySettings['default'];
  public headerDetails : { Img: string; Description: string;} = { Img: '', Description: ''};

  constructor(private route: ActivatedRoute) {}

  // public selectedTab: string = 'necklace'; // Default tab
  public necklaceImageTop: string = 'assets/home/necklace-header.jpg';
  public necklaceImageBottom: string = 'assets/home/necklace-bottom.jpg';
  public braceletImageTop: string = 'assets/home/bracelet-header.jpg'; 
  public braceletImageBottom: string = 'assets/home/bracelet-bottom.jpg'; 

  // selectTab(tab: string) {
  //   this.selectedTab = tab;
  // }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {

      const companyName = params.get("company");
      const queryParams = companyName ? { company: companyName } : {};
      this.companySetting = companyName ? companySettings[companyName] : companySettings['default'];

      this.buildersData = [
        { Img: 'assets/home/block-name-necklace.jpg', Description: 'Name Necklace', Url: `/name-necklace-builder`, queryParams },
        { Img: 'assets/home/date-necklace.jpg', Description: 'Date Necklace', Url: `/date-necklace-builder`, queryParams },
        { Img: 'assets/home/block-name-bracelet.jpg', Description: 'Name Bracelet', Url: `/name-bracelet-builder`, queryParams },
        { Img: 'assets/home/date-bracelet.jpg', Description: 'Date Bracelet', Url: `/date-bracelet-builder`, queryParams }
      ];
    });
  }
}