import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentsDialogComponent } from './segments-dialog.component';

describe('SegmentsDialogComponent', () => {
  let component: SegmentsDialogComponent;
  let fixture: ComponentFixture<SegmentsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SegmentsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SegmentsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
