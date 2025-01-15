import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessibleRangeInputComponent } from './accessible-range-input.component';

describe('AccessibleRangeInputComponent', () => {
  let component: AccessibleRangeInputComponent;
  let fixture: ComponentFixture<AccessibleRangeInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessibleRangeInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessibleRangeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
