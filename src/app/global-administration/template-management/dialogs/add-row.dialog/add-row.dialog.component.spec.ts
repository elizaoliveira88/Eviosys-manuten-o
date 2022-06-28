import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRow.DialogComponent } from './add-row.dialog.component';

describe('AddRow.DialogComponent', () => {
  let component: AddRow.DialogComponent;
  let fixture: ComponentFixture<AddRow.DialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddRow.DialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRow.DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
