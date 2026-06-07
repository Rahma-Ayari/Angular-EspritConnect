import { TestBed } from '@angular/core/testing';

import { DigestConfigService } from './digest-config.service';

describe('DigestConfigService', () => {
  let service: DigestConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DigestConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
