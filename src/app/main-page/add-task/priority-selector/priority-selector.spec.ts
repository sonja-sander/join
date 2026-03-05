import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrioritySelector } from './priority-selector';

describe('PrioritySelector', () => {
  let component: PrioritySelector;
  let fixture: ComponentFixture<PrioritySelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrioritySelector],
    }).compileComponents();

    fixture = TestBed.createComponent(PrioritySelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
