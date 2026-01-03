import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LexikAuthTest } from './lexik-auth-test';

describe('LexikAuthTest', () => {
  let component: LexikAuthTest;
  let fixture: ComponentFixture<LexikAuthTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LexikAuthTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LexikAuthTest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
