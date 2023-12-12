import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeNameComponent } from './change-name.component';

describe('ChangeNameComponent', () => {
  let component: ChangeNameComponent;
  let fixture: ComponentFixture<ChangeNameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeNameComponent]
    });
    fixture = TestBed.createComponent(ChangeNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
