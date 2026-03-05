import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownAssignee } from './dropdown-assignee';
import { FirebaseService } from '../../../shared/services/firebase-service';

describe('DropdownAssignee', () => {
  let component: DropdownAssignee;
  let fixture: ComponentFixture<DropdownAssignee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownAssignee],
      providers: [
        {
          provide: FirebaseService,
          useValue: {
            contacts: [],
            loading: false,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownAssignee);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
