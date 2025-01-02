import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'button[wtiii-delete-button]',
  imports: [],
  templateUrl: './delete-button.component.html',
  styleUrls: [
    './delete-button.component.scss',
    '../shared-button-styles.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.title]': 'label',
    '[attr.aria-label]': 'label',
    'type': 'button',
  }
})
export class DeleteButtonComponent {
  protected readonly label = 'Delete';
}
