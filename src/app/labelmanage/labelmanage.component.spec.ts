import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelmanageComponent } from './labelmanage.component';

describe('LabelmanageComponent', () => {
  let component: LabelmanageComponent;
  let fixture: ComponentFixture<LabelmanageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LabelmanageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabelmanageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
