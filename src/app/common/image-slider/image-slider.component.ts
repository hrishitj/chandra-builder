import { Component, input } from '@angular/core';

@Component({
  selector: 'app-image-slider',
  imports: [],
  templateUrl: './image-slider.component.html',
  styleUrl: './image-slider.component.scss'
})
export class ImageSliderComponent {
  public mediaItems = input<string[]>([]);
  public themeColor = input<string>('#000000');

  public selectedIndex: number = 0;

  isImage(item: string): boolean {
    return /\.(jpg|jpeg|png|gif)$/i.test(item);
  }

  // Handle selection of a media item
  selectMedia(index: number): void {
    this.selectedIndex = index;
  }
}
