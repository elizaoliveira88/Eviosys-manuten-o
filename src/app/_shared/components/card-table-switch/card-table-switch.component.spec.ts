import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardTableSwitchComponent } from './card-table-switch.component';

describe('CardTableSwitchComponent', () => {
  let component: CardTableSwitchComponent;
  let fixture: ComponentFixture<CardTableSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardTableSwitchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardTableSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
