import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchInputTableComponent } from './search-input-table.component';

describe('SearchInputTableComponent', () => {
  let component: SearchInputTableComponent;
  let fixture: ComponentFixture<SearchInputTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchInputTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchInputTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
