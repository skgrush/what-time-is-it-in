import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeHighlightModalComponent } from './time-highlight-modal.component';

describe('TimeHighlightModalComponent', () => {
  let component: TimeHighlightModalComponent;
  let fixture: ComponentFixture<TimeHighlightModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeHighlightModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeHighlightModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
