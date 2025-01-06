import { TestBed } from '@angular/core/testing';

import { TimezoneSvgService } from './timezone-svg.service';

describe('TimezoneSvgService', () => {
  let service: TimezoneSvgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimezoneSvgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
