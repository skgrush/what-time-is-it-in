import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TimeHighlightPickerComponent } from './time-highlight-picker/time-highlight-picker.component';
import { TimeHighlightService } from './time-highlight.service';

@Component({
  selector: 'wtiii-time-highlight-modal',
  imports: [
    TimeHighlightPickerComponent,
  ],
  templateUrl: './time-highlight-modal.component.html',
  styleUrl: './time-highlight-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeHighlightModalComponent {
  protected readonly service = inject(TimeHighlightService);
}
