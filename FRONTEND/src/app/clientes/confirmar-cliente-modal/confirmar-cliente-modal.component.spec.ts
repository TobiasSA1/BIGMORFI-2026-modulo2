import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmarClienteModalComponent } from './confirmar-cliente-modal.component';

describe('ConfirmarClienteModalComponent', () => {
  let component: ConfirmarClienteModalComponent;
  let fixture: ComponentFixture<ConfirmarClienteModalComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmarClienteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
