import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateNecklaceBuilderComponent } from './date-necklace-builder.component';

describe('DateNecklaceBuilderComponent', () => {
  let component: DateNecklaceBuilderComponent;
  let fixture: ComponentFixture<DateNecklaceBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateNecklaceBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateNecklaceBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
