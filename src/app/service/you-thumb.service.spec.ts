import { TestBed, inject } from '@angular/core/testing';

import { YouThumbService } from './you-thumb.service';

describe('YouThumbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [YouThumbService]
    });
  });

  it('should be created', inject([YouThumbService], (service: YouThumbService) => {
    expect(service).toBeTruthy();
  }));
});
