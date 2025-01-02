import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneColumnComponent } from './zone-column.component';

describe('ZoneColumnComponent', () => {
  let component: ZoneColumnComponent;
  let fixture: ComponentFixture<ZoneColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoneColumnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZoneColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
