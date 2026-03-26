import { Component, input, output } from '@angular/core';
import { Task } from '../../../shared/interfaces/task';
import { Icon } from '../../../shared/components/icon/icon';

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
  imports: [Icon],
  templateUrl: './priority-selector.html',
  styleUrl: './priority-selector.scss',
})
export class PrioritySelector {
  selectedPriority = input<Task['priority']>('medium');

  selectedPriorityChange = output<Task['priority']>();

  options: Array<PriorityOption> = [
    {
      value: 'high',
      label: 'Urgent',
      iconPath: 'priority-high',
      modifierClass: 'priority__button--urgent',
    },
    {
      value: 'medium',
      label: 'Medium',
      iconPath: 'priority-medium',
      modifierClass: 'priority__button--medium',
    },
    {
      value: 'low',
      label: 'Low',
      iconPath: 'priority-low',
      modifierClass: 'priority__button--low',
    },
  ];

  /**
   * Updates and emits the selected priority.
   * @param newPrio Priority chosen by the user.
   */
  selectPriority(newPrio: Task['priority']): void {
    this.selectedPriorityChange.emit(newPrio);
  }
}
