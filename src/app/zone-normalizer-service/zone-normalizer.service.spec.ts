import { TestBed } from '@angular/core/testing';

import { ZoneNormalizerService } from './zone-normalizer.service';

describe('ZoneNormalizerService', () => {
  let service: ZoneNormalizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZoneNormalizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
