import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentsInitDialogComponent } from './segments-init-dialog.component';

describe('SegmentsDialogComponent', () => {
  let component: SegmentsInitDialogComponent;
  let fixture: ComponentFixture<SegmentsInitDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SegmentsInitDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SegmentsInitDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
