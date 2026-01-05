import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Balances } from './balances';

describe('Balances', () => {
  let component: Balances;
  let fixture: ComponentFixture<Balances>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Balances]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Balances);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
