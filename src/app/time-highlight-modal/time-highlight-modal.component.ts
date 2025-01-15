import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { TimeHighlightPickerComponent } from './time-highlight-picker/time-highlight-picker.component';
import { TimeHighlightService } from './time-highlight.service';
import { TimeHighlightModalResizeService } from './time-highlight-modal-resize.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'wtiii-time-highlight-modal',
  imports: [
    TimeHighlightPickerComponent,
  ],
  templateUrl: './time-highlight-modal.component.html',
  styleUrl: './time-highlight-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeHighlightModalComponent {
  readonly #resizeService =  inject(TimeHighlightModalResizeService);
  readonly #elementRef = inject(ElementRef<HTMLElement>);

  protected readonly service = inject(TimeHighlightService);

  readonly #fx = {
    resizeSub: this.#resizeService
      .listen(this.#elementRef.nativeElement)
      .pipe(takeUntilDestroyed())
      .subscribe(),
  }
}
