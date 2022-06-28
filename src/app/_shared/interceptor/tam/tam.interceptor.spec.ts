import { TestBed, inject } from '@angular/core/testing';

import { TamInterceptor } from './tam.interceptor';

describe('TamInterceptorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TamInterceptor]
    });
  });

  it('should be created', inject([TamInterceptor], (service: TamInterceptor) => {
    expect(service).toBeTruthy();
  }));
});
