import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeHighlightPickerComponent } from './time-highlight-picker.component';

describe('TimeHighlightPickerComponent', () => {
  let component: TimeHighlightPickerComponent;
  let fixture: ComponentFixture<TimeHighlightPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeHighlightPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeHighlightPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
