import { TestBed } from '@angular/core/testing';
import { HelpStateService } from './help-state';

describe('HelpStateService', () => {
  let service: HelpStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HelpStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});