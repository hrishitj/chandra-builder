import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { companySettings } from '../common/companyCustomization';
import { cp } from 'node:fs';

@Component({
  selector: 'app-home-page',
  imports: [RouterModule, CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {

  public buildersData: { Img: string; Description: string; Url: string, queryParams: any }[] = [];
  public companySetting: { theme: string; multiplier: number; header: {img: string, description: string} } = companySettings['default'];
  public headerDetails : { Img: string; Description: string;} = { Img: '', Description: ''};

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {

      const companyName = params.get("company");
      const queryParams = companyName ? { company: companyName } : {};
      this.companySetting = companyName ? companySettings[companyName] : companySettings['default'];

      this.buildersData = [
        { Img: 'assets/home/homePage_1.jpg', Description: 'NAME NECKLACE', Url: `/name-necklace-builder`, queryParams },
        { Img: 'assets/home/homePage_2.jpg', Description: 'NAME BRACELET', Url: `/name-bracelet-builder`, queryParams },
        { Img: 'assets/home/homePage_1.jpg', Description: 'DATE NECKLACE', Url: `/date-necklace-builder`, queryParams },
        { Img: 'assets/home/homePage_2.jpg', Description: 'DATE BRACELET', Url: `/date-bracelet-builder`, queryParams }
      ];
    });
  }
  
}
