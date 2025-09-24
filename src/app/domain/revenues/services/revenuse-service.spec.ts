import { TestBed } from '@angular/core/testing';

import { RevenuseService } from './revenuse-service';

describe('RevenuseService', () => {
  let service: RevenuseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RevenuseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
