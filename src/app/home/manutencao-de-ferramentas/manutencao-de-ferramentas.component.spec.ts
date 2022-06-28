import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManutencaoDeFerramentasComponent } from './manutencao-de-ferramentas.component';

describe('ManutencaoDeFerramentasComponent', () => {
  let component: ManutencaoDeFerramentasComponent;
  let fixture: ComponentFixture<ManutencaoDeFerramentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManutencaoDeFerramentasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManutencaoDeFerramentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
