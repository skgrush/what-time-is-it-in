import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockHighlightComponent } from './clock-highlight.component';

describe('ClockHighlightComponent', () => {
  let component: ClockHighlightComponent;
  let fixture: ComponentFixture<ClockHighlightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClockHighlightComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClockHighlightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
