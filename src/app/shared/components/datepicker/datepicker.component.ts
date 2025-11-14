import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, DestroyRef, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'date-range-picker',
  templateUrl: './datepicker.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangePicker {
  @Output() rangeSelected = new EventEmitter<{ start: Date | null; end: Date | null }>();
  @Output() refreshRequested = new EventEmitter<void>();

  private destroyRef = inject(DestroyRef);

  startDateControl = new FormControl<string | null>(null);
  endDateControl = new FormControl<string | null>(null);
  isLoading = signal(false);

  constructor() {
    this.startDateControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.emitDateRange());

    this.endDateControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.emitDateRange());
  }

  private emitDateRange() {
    const startStr = this.startDateControl.value;
    const endStr = this.endDateControl.value;

    const start = startStr ? new Date(startStr + 'T00:00:00') : null;
    const end = endStr ? new Date(endStr + 'T23:59:59') : null;

    if (start && end) {
      this.rangeSelected.emit({ start, end });
    }
  }

  onRefresh() {
    this.refreshRequested.emit();
  }
}
