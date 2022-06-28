import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentsExampleViewComponent } from './components-example-view.component';

describe('ComponentsExampleViewComponent', () => {
  let component: ComponentsExampleViewComponent;
  let fixture: ComponentFixture<ComponentsExampleViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentsExampleViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentsExampleViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
