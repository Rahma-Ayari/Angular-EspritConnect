import { Component, Input, OnChanges } from '@angular/core';
import { Event } from '../../models/event.model';

interface CalendarDay {
  date: Date;
  day: number;
  inMonth: boolean;
  today: boolean;
  events: Event[];
}

@Component({
  selector: 'app-event-calendar',
  templateUrl: './event-calendar.component.html',
  styleUrls: ['./event-calendar.component.css']
})
export class EventCalendarComponent implements OnChanges {
  @Input() events: Event[] = [];

  currentMonth = new Date();
  days: CalendarDay[] = [];
  selectedDay: CalendarDay | null = null;
  readonly weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  ngOnChanges(): void {
    this.buildCalendar();
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.buildCalendar();
  }

  selectDay(day: CalendarDay): void {
    this.selectedDay = day;
  }

  get monthLabel(): string {
    return this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  private buildCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - startOffset);
    const todayKey = this.key(this.todayDate());

    this.days = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const events = this.eventsForDate(date);
      return {
        date,
        day: date.getDate(),
        inMonth: date.getMonth() === month,
        today: this.key(date) === todayKey,
        events
      };
    });

    this.selectedDay = this.days.find(day => day.today) || this.days.find(day => day.events.length > 0) || this.days[0];
  }

  private todayDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private eventsForDate(date: Date): Event[] {
    const key = this.key(date);
    return this.events.filter(event => {
      const start = event.dateDebut || event.dateEvenement;
      if (!start) return false;
      const startStr = typeof start === 'string' ? start.slice(0, 10) : this.key(new Date(start));
      return startStr === key;
    });
  }

  private key(date: Date): string {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
