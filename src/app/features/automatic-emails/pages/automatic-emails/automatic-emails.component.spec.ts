import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomaticEmailsComponent } from './automatic-emails.component';

describe('AutomaticEmailsComponent', () => {
  let component: AutomaticEmailsComponent;
  let fixture: ComponentFixture<AutomaticEmailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AutomaticEmailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutomaticEmailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
