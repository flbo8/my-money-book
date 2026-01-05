import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRepos } from './user-repos';

describe('UserRepos', () => {
  let component: UserRepos;
  let fixture: ComponentFixture<UserRepos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRepos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRepos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
