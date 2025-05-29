import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-text-with-image-button',
  imports: [],
  templateUrl: './text-with-image-button.component.html',
  styleUrl: './text-with-image-button.component.scss'
})
export class TextWithImageButtonComponent {
  public buttonText = input<string>();
  public imageSource = input<string>();
  public isSelected = input<boolean>(false);
  public themeColor = input<string>('#000000');
  public clicked = output<void>();

}
