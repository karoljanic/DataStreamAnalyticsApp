import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivationComponent } from './activation.component';

describe('ActivationComponent', () => {
  let component: ActivationComponent;
  let fixture: ComponentFixture<ActivationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActivationComponent]
    });
    fixture = TestBed.createComponent(ActivationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
