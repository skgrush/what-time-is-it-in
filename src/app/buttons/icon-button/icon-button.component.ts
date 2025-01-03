import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'button[wtiii-icon-button]',
  imports: [],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.title]': 'label()',
    '[attr.aria-label]': 'label()',
    'type': 'button',
  }
})
export class IconButtonComponent {

  readonly label = input.required<string>({
    alias: 'wtiii-icon-button',
  });


}
