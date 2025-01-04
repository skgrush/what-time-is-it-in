import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MapOpenerService {

  readonly isOpen = signal(false);
}
