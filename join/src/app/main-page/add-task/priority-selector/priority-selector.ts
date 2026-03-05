import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../../shared/interfaces/task';

/** View model describing one priority button in the selector. */
type PriorityOption = {
  value: Task['priority'];
  label: string;
  iconPath: string;
  modifierClass: string;
};

/**
 * Segmented selector for choosing task priority.
 */
@Component({
  selector: 'app-priority-selector',
  imports: [],
  templateUrl: './priority-selector.html',
  styleUrl: './priority-selector.scss',
})
export class PrioritySelector {
  /** Currently selected priority value. */
  @Input() selectedPriority: Task['priority'] = 'medium';
  /** Emits when the selected priority changes. */
  @Output() selectedPriorityChange = new EventEmitter<Task['priority']>();

  /** Available priority options rendered in the selector. */
  options: PriorityOption[] = [
    {
      value: 'high',
      label: 'Urgent',
      iconPath: 'assets/img/icons/priority/priority-high.svg',
      modifierClass: 'priority__button--urgent',
    },
    {
      value: 'medium',
      label: 'Medium',
      iconPath: 'assets/img/icons/priority/priority-medium.svg',
      modifierClass: 'priority__button--medium',
    },
    {
      value: 'low',
      label: 'Low',
      iconPath: 'assets/img/icons/priority/priority-low.svg',
      modifierClass: 'priority__button--low',
    },
  ];

  /**
   * Updates and emits the selected priority.
   * @param newPrio Priority chosen by the user.
   */
  selectPriority(newPrio: Task['priority']): void {
    this.selectedPriority = newPrio;
    this.selectedPriorityChange.emit(newPrio);
  }
}
