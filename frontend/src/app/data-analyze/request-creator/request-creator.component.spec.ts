import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestCreatorComponent } from './request-creator.component';

describe('RequestCreatorComponent', () => {
  let component: RequestCreatorComponent;
  let fixture: ComponentFixture<RequestCreatorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequestCreatorComponent]
    });
    fixture = TestBed.createComponent(RequestCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
