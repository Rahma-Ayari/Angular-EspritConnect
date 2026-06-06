import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-cv-uploader',
  templateUrl: './cv-uploader.component.html',
  styleUrls: ['./cv-uploader.component.css']
})
export class CvUploaderComponent {
  @Output() fileSelected = new EventEmitter<File>();

  onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.fileSelected.emit(input.files[0]);
    }
  }
}
