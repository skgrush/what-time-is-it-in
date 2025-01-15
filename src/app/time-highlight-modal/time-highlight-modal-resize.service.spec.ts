import { TestBed } from '@angular/core/testing';

import { TimeHighlightModalResizeService } from './time-highlight-modal-resize.service';

describe('TimeHighlightModalResizeService', () => {
  let service: TimeHighlightModalResizeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeHighlightModalResizeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
