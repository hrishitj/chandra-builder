import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, inject, input, NgZone, OnDestroy, OnInit, PLATFORM_ID, signal, ViewChild } from '@angular/core';

@Component({
  selector: 'app-image-slider',
  imports: [],
  templateUrl: './image-slider.component.html',
  styleUrl: './image-slider.component.scss'
})
export class ImageSliderComponent implements AfterViewInit, OnDestroy {
  public mediaItems = input<string[]>([]);
  public themeColor = input<string>('#000000');
  public isSmallView = signal<boolean>(false);
  private platformId = inject(PLATFORM_ID);
  private resizeListener!: () => void;

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

  private onResize(): void {
    this.checkWindowWidth();
  }

  private checkWindowWidth(): void {
    this.isSmallView.set(window.innerWidth < 800);
  }
  

  public selectedIndex: number = 0;

  isImage(item: string): boolean {
    return /\.(jpg|jpeg|png|gif)$/i.test(item);
  }

  // Handle selection of a media item
  selectMedia(index: number): void {
    this.selectedIndex = index;
  }
}
