import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeSurnameComponent } from './change-surname.component';

describe('ChangeSurnameComponent', () => {
  let component: ChangeSurnameComponent;
  let fixture: ComponentFixture<ChangeSurnameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeSurnameComponent]
    });
    fixture = TestBed.createComponent(ChangeSurnameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
