import { TestBed } from '@angular/core/testing';

import { DomElementService } from './dom-element.service';

describe('DomElementService', () => {
  let service: DomElementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DomElementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
