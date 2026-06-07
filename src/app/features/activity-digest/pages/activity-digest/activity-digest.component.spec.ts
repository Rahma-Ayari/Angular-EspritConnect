import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityDigestComponent } from './activity-digest.component';

describe('ActivityDigestComponent', () => {
  let component: ActivityDigestComponent;
  let fixture: ComponentFixture<ActivityDigestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityDigestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityDigestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
