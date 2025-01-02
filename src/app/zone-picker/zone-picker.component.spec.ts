import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZonePickerComponent } from './zone-picker.component';

describe('ZonePickerComponent', () => {
  let component: ZonePickerComponent;
  let fixture: ComponentFixture<ZonePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZonePickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZonePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
