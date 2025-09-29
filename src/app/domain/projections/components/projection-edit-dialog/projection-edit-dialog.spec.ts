import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectionEditDialog } from './projection-edit-dialog';

describe('ProjectionEditDialog', () => {
  let component: ProjectionEditDialog;
  let fixture: ComponentFixture<ProjectionEditDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectionEditDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectionEditDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
