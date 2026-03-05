import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskFormField } from './task-form-field';

describe('TaskFormField', () => {
  let component: TaskFormField;
  let fixture: ComponentFixture<TaskFormField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormField],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
