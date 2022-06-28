import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentDataManagementComponent } from './component-data-management.component';

describe('ComponentDataManagementComponent', () => {
  let component: ComponentDataManagementComponent;
  let fixture: ComponentFixture<ComponentDataManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentDataManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentDataManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
