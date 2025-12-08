import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayPage } from 'src/app/today/today.page';

describe('Tab1Page', () => {
  let component: TodayPage;
  let fixture: ComponentFixture<TodayPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TodayPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
