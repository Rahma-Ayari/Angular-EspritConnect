import { Component, EventEmitter, Input, Output, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.css']
})
export class TimePickerComponent implements OnChanges, OnInit {
  @Input() label = 'Time';
  @Input() value: string | null = '';

  @Output() valueChange = new EventEmitter<string>();

  hours12: string[] = Array.from({ length: 12 }, (_, i) => String(i + 1));
  minutes: string[] = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  selectedHour12: string = '12';
  selectedMinute: string = '00';
  selectedPeriod: 'AM' | 'PM' = 'AM';

  ngOnInit(): void {
    if (this.value && this.value.trim()) {
      this.emitValue();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.syncFromValue(this.value);
    }
  }

  private syncFromValue(value: string | null): void {
    const timeStr = value?.trim();
    if (!timeStr) {
      this.selectedHour12 = '12';
      this.selectedMinute = '00';
      this.selectedPeriod = 'AM';
      return;
    }

    const parts = timeStr.split(':');
    const hour24 = parseInt(parts[0] ?? '0', 10);
    const minute = parseInt(parts[1] ?? '00', 10);

    this.selectedMinute = String(Math.round(minute / 5) * 5).padStart(2, '0');
    if (this.selectedMinute === '60') this.selectedMinute = '55';
    this.selectedPeriod = hour24 >= 12 ? 'PM' : 'AM';

    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    this.selectedHour12 = String(hour12);
  }

  emitValue(): void {
    const hour12 = parseInt(this.selectedHour12, 10);
    const hour24 = this.selectedPeriod === 'AM' ? hour12 % 12 : hour12 % 12 + 12;
    const value = `${String(hour24).padStart(2, '0')}:${this.selectedMinute}`;
    this.valueChange.emit(value);
  }
}
