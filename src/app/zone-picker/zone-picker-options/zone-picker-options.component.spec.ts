import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZonePickerOptionsComponent } from './zone-picker-options.component';

describe('ZonePickerOptionsComponent', () => {
  let component: ZonePickerOptionsComponent;
  let fixture: ComponentFixture<ZonePickerOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZonePickerOptionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZonePickerOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
