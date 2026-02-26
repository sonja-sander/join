import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Attachments } from './attachments';

describe('Attachments', () => {
  let component: Attachments;
  let fixture: ComponentFixture<Attachments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Attachments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Attachments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
