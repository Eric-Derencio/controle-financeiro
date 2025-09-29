import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectionTable } from './projection-table';

describe('ProjectionTable', () => {
  let component: ProjectionTable;
  let fixture: ComponentFixture<ProjectionTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectionTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectionTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
