import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGroup.DialogComponent } from './add-group.dialog.component';

describe('AddGroup.DialogComponent', () => {
  let component: AddGroup.DialogComponent;
  let fixture: ComponentFixture<AddGroup.DialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddGroup.DialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGroup.DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
