import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'button[wtiii-add-button]',
  imports: [],
  templateUrl: './add-button.component.html',
  styleUrls: [
    './add-button.component.scss',
    '../shared-button-styles.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.title]': 'label',
    '[attr.aria-label]': 'label',
    'type': 'button',
  }
})
export class AddButtonComponent {
  protected readonly label = 'Add';
}
