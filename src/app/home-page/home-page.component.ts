import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { companySettings } from '../common/companyCustomization';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-home-page',
  imports: [RouterModule, CommonModule, MatDividerModule],
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
    { question: "How long does it take to create my personalized jewelry?", answer: "Each piece is custom-made with care. Typically, it takes between 7 and 10 business days for us to craft and ship your personalized jewelry. We'll provide an estimated delivery date when you place your order.", open: false },
    { question: "What materials are your jewelry pieces made from?", answer: "Our jewelry is crafted from high-quality gold paired with diamonds. Each piece is designed to offer lasting beauty and durability.", open: false },
    { question: "Do you offer resizing for necklaces or bracelets?", answer: "Yes, we offer resizing services for our bracelets and necklaces. Please contact our customer service team with your sizing request, and we'll help you find the perfect fit.", open: false },
    { question: "Can I cancel or modify my order after it's been placed?", answer: "Once an order has been customized and processed, we are unable to modify or cancel it. However, please contact our customer service team as soon as possible if there are any issues, and we will assist you to the best of our ability.", open: false },
    { question: "Can I request additional customizations beyond the available font, letter, or date options?", answer: "Yes! If you have a unique design or special customization request that goes beyond our standard font styles, letters, or date options, we'd love to help bring your vision to life. Please contact our customer service team with your specific request, and we'll work with you to create a one-of-a-kind piece that suits your needs.", open: false },
    { question: "What is your return/exchange policy?", answer: "As our jewelry is personalized, we do not accept returns or exchanges unless the item is damaged or defective. Please review your customization details carefully before completing your order. If there is an issue with your item, contact us, and we'll ensure a resolution.", open: false },
    { question: "How can I track my order?", answer: "Once your order is shipped, you will receive a tracking number via email. You can use this number to track your package's journey directly on the shipping carrier's website.", open: false },
    { question: "How should I care for my custom nameplate jewelry?", answer: "To maintain the beauty of your nameplate necklace or bracelet, we recommend cleaning it with a soft cloth and mild soapy water. Avoid exposing your jewelry to harsh chemicals, perfumes, or lotions.", open: false }
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