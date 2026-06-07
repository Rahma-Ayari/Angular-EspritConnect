import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigestPreviewComponent } from './digest-preview.component';

describe('DigestPreviewComponent', () => {
  let component: DigestPreviewComponent;
  let fixture: ComponentFixture<DigestPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DigestPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DigestPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
