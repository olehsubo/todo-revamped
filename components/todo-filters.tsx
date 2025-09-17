import { type ChangeEvent } from 'react';

const priorityFilterOptions = [
  { value: 'all', label: 'All priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
] as const;

const sortOptions = [
  { value: 'created-desc', label: 'Newest first' },
  { value: 'created-asc', label: 'Oldest first' },
  { value: 'priority-desc', label: 'Priority high → low' },
  { value: 'priority-asc', label: 'Priority low → high' },
  { value: 'title-asc', label: 'Title A → Z' },
  { value: 'title-desc', label: 'Title Z → A' },
  { value: 'due-asc', label: 'Due soonest' },
  { value: 'due-desc', label: 'Due latest' }
] as const;

export type PriorityFilter = (typeof priorityFilterOptions)[number]['value'];
export type SortOption = (typeof sortOptions)[number]['value'];

interface TodoFiltersProps {
  priority: PriorityFilter;
  dueBefore: string;
  sort: SortOption;
  search: string;
  hasActiveFilters: boolean;
  onPriorityChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onDueBeforeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSortChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

export function TodoFilters({
  priority,
  dueBefore,
  sort,
  search,
  hasActiveFilters,
  onPriorityChange,
  onDueBeforeChange,
  onSortChange,
  onSearchChange,
  onClear
}: TodoFiltersProps) {
  return (
    <div className='filters-panel'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='form-layout sm:grid-cols-4'>
          <div className='form-field sm:col-span-2'>
            <label className='form-label' htmlFor='todo-filter-search'>
              Search
            </label>
            <input
              id='todo-filter-search'
              className='form-input'
              type='text'
              value={search}
              onChange={onSearchChange}
              placeholder='Title or notes keywords'
              autoComplete='off'
            />
          </div>

          <div className='form-field'>
            <label className='form-label' htmlFor='todo-filter-priority'>
              Priority
            </label>
            <select
              id='todo-filter-priority'
              className='form-select'
              value={priority}
              onChange={onPriorityChange}
            >
              {priorityFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className='form-field'>
            <label className='form-label' htmlFor='todo-filter-due-before'>
              Due on or before
            </label>
            <input
              id='todo-filter-due-before'
              className='form-input'
              type='date'
              value={dueBefore}
              onChange={onDueBeforeChange}
            />
            <p className='form-helper'>
              Leave blank to see todos without a due date.
            </p>
          </div>

          <div className='form-field'>
            <label className='form-label' htmlFor='todo-sort-order'>
              Sort by
            </label>
            <select
              id='todo-sort-order'
              className='form-select'
              value={sort}
              onChange={onSortChange}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters ? (
          <button
            type='button'
            className='action-button self-start sm:self-auto'
            onClick={onClear}
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}
