import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimezoneMappingComponent } from './timezone-mapping.component';

describe('TimezoneMappingComponent', () => {
  let component: TimezoneMappingComponent;
  let fixture: ComponentFixture<TimezoneMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimezoneMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimezoneMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
