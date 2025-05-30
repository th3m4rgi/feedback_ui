import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoStepFormComponent } from './two-step-form.component';

describe('MultiStepFormComponent', () => {
  let component: TwoStepFormComponent;
  let fixture: ComponentFixture<TwoStepFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoStepFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwoStepFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
