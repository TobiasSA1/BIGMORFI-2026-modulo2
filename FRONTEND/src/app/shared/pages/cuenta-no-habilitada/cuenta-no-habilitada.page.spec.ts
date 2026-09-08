import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CuentaNoHabilitadaPage } from './cuenta-no-habilitada.page';

describe('CuentaNoHabilitadaPage', () => {
  let component: CuentaNoHabilitadaPage;
  let fixture: ComponentFixture<CuentaNoHabilitadaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CuentaNoHabilitadaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
