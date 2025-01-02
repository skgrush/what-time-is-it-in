import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalClockComponent } from './vertical-clock.component';

describe('VerticalClockComponent', () => {
  let component: VerticalClockComponent;
  let fixture: ComponentFixture<VerticalClockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerticalClockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerticalClockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
