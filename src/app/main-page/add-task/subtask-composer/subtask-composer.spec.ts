import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtaskComposer } from './subtask-composer';

describe('SubtaskComposer', () => {
  let component: SubtaskComposer;
  let fixture: ComponentFixture<SubtaskComposer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubtaskComposer],
    }).compileComponents();

    fixture = TestBed.createComponent(SubtaskComposer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
