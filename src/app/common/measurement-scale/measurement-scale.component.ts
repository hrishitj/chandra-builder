import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-measurement-scale',
  imports: [],
  templateUrl: './measurement-scale.component.html',
  styleUrl: './measurement-scale.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeasurementScaleComponent {
  height = input<string | null>();
  width = input<number>();
}
