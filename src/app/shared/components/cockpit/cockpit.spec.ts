import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cockpit } from './cockpit';

describe('Cockpit', () => {
  let component: Cockpit;
  let fixture: ComponentFixture<Cockpit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cockpit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cockpit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
