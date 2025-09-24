import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueList } from './revenue-list';

describe('RevenueList', () => {
  let component: RevenueList;
  let fixture: ComponentFixture<RevenueList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
