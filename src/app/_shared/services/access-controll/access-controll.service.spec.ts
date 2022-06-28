import { TestBed } from '@angular/core/testing';

import { AccessControllService } from './access-controll.service';

describe('AccessControllService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccessControllService = TestBed.get(AccessControllService);
    expect(service).toBeTruthy();
  });
});
