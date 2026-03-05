import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownCategory } from './dropdown-category';
import { TaskService } from '../../../shared/services/task-service';

describe('DropdownCategory', () => {
  let component: DropdownCategory;
  let fixture: ComponentFixture<DropdownCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownCategory],
      providers: [
        {
          provide: TaskService,
          useValue: {
            taskCategories: [],
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownCategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
