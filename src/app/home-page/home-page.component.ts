import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { companySettings } from '../common/companyCustomization';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-home-page',
  imports: [RouterModule, CommonModule, MatDividerModule ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {

  public buildersData: { Img: string; Description: string; Url: string, queryParams: any }[] = [];
  public companySetting: { theme: string; multiplier: number; header: {img: string, description: string []} } = companySettings['default'];
  public headerDetails : { Img: string; Description: string;} = { Img: '', Description: ''};

  constructor(private route: ActivatedRoute) {}

  public selectedTab: string = 'necklace'; // Default tab
  public necklaceImageTop: string = 'assets/home/necklace-header.jpg';
  public necklaceImageBottom: string = 'assets/home/necklace-bottom.jpg';
  public braceletImageTop: string = 'assets/home/bracelet-header.jpg'; 
  public braceletImageBottom: string = 'assets/home/bracelet-bottom.jpg'; 

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

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

  faqs = [
    { question: "How long does it take to create my personalized jewelry?", answer: "Sample Answer", open: false },
    { question: "What materials are your jewelry pieces made from?", answer: "Sample Answer", open: false },
    { question: "Do you offer resizing for necklaces or bracelets?", answer: "Sample Answer", open: false },
    { question: "Can I cancel or modify my order after it’s been placed?", answer: "Sample Answer", open: false },
    { question: "Can I request additional customizations beyond the available font, letter, or date options?", answer: "Sample Answer", open: false },
    { question: "What is your return/exchange policy?", answer: "Sample Answer", open: false },
    { question: "How can I track my order?", answer: "Sample Answer", open: false },
    { question: "How should I care for my custom nameplate jewelry?", answer: "Sample Answer", open: false }
  ];

  // Toggle function to open/close an individual FAQ
  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }

  // Function to toggle all FAQs open/closed
  toggleAll() {
    const allOpen = this.faqs.every(faq => faq.open);
    this.faqs.forEach(faq => faq.open = !allOpen);
  } 
}