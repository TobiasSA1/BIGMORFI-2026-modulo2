import { TestBed } from '@angular/core/testing';
import { EscanerQrService } from './escaner-qr.service';

describe('EscanerQrService', () => {
  let service: EscanerQrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EscanerQrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
