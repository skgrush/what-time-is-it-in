import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'button[wtiii-copy-button]',
  imports: [],
  templateUrl: './copy-button.component.html',
  styleUrls: [
    './copy-button.component.scss',
    '../shared-button-styles.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.title]': 'label',
    '[attr.aria-label]': 'label',
    'type': 'button',
  }
})
export class CopyButtonComponent {
  protected readonly label = 'Copy';
}
