import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrucksChartComponent } from './trucks-chart.component';

describe('TrucksChartComponent', () => {
  let component: TrucksChartComponent;
  let fixture: ComponentFixture<TrucksChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrucksChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrucksChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
