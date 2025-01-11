import { TestBed } from '@angular/core/testing';

import { TimeHighlightService } from './time-highlight.service';

describe('TimeHighlightService', () => {
  let service: TimeHighlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeHighlightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
