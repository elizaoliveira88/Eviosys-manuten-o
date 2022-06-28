import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TruckDataManagementComponent } from './truck-data-management.component';

describe('TruckDataManagementComponent', () => {
  let component: TruckDataManagementComponent;
  let fixture: ComponentFixture<TruckDataManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TruckDataManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TruckDataManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
