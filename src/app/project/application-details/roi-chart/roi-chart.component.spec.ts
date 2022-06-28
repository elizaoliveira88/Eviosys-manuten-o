import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoiChartComponent } from './roi-chart.component';

describe('YearsChartComponent', () => {
  let component: RoiChartComponent;
  let fixture: ComponentFixture<RoiChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoiChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoiChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
