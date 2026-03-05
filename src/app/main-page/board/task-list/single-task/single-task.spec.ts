import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleTask } from './single-task';

describe('SingleTask', () => {
  let component: SingleTask;
  let fixture: ComponentFixture<SingleTask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleTask]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleTask);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
