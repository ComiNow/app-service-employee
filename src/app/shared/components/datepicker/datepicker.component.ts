import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, DestroyRef } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormGroup, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'date-range-picker',
  templateUrl: './datepicker.component.html',
  providers: [provideNativeDateAdapter()],
  imports: [MatFormFieldModule, MatDatepickerModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangePicker {
  @Output() rangeSelected = new EventEmitter<{ start: Date | null; end: Date | null }>();
  private destroyRef = inject(DestroyRef);

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor() {
    this.range.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.rangeSelected.emit({
          start: value.start ?? null,
          end: value.end ?? null
        });
      });
  }
}
