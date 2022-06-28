import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Comments.DialogComponent } from './comments.dialog.component';

describe('Comments.DialogComponent', () => {
  let component: Comments.DialogComponent;
  let fixture: ComponentFixture<Comments.DialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Comments.DialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Comments.DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
