import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateBraceletBuilderComponent } from './date-bracelet-builder.component';

describe('DateBraceletBuilderComponent', () => {
  let component: DateBraceletBuilderComponent;
  let fixture: ComponentFixture<DateBraceletBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateBraceletBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateBraceletBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
