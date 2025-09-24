import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueForm } from './revenue-form';

describe('RevenueForm', () => {
  let component: RevenueForm;
  let fixture: ComponentFixture<RevenueForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
