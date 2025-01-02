import { Component } from '@angular/core';
import { ZoneColumnComponent } from './zone-column/zone-column.component';

@Component({
  selector: 'wtiii-root',
  imports: [ZoneColumnComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'what-time-is-it-in';
}
