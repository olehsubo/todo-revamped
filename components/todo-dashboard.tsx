'use client';

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { Form } from '@/components/form';
import { TodoList, seededTodos, type TodoItem } from '@/components/todo-list';
import {
  TodoFilters,
  type PriorityFilter,
  type SortOption
} from '@/components/todo-filters';

type NewTodoInput = Omit<TodoItem, 'id'>;

const STORAGE_KEY = 'todo-revamped::todos';

function isStoredTodo(value: unknown): value is TodoItem {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.title === 'string' &&
    typeof record.description === 'string' &&
    (record.priority === 'low' || record.priority === 'medium' || record.priority === 'high') &&
    (record.dueDate === undefined || typeof record.dueDate === 'string')
  );
}

function parseStoredTodos(value: string | null): TodoItem[] | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return null;
    }
    const todos = parsed.filter(isStoredTodo);
    return todos.length > 0 ? todos : [];
  } catch (error) {
    console.warn('[todo] failed to parse stored todos', error);
    return null;
  }
}

function parseCalendarDate(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function comparePriority(a: TodoItem['priority'], b: TodoItem['priority']) {
  const priorityWeight: Record<TodoItem['priority'], number> = {
    high: 3,
    medium: 2,
    low: 1
  };
  return priorityWeight[a] - priorityWeight[b];
}

function compareDate(aDate: string | undefined, bDate: string | undefined) {
  const a = parseCalendarDate(aDate);
  const b = parseCalendarDate(bDate);

  if (!a && !b) {
    return 0;
  }
  if (!a) {
    return 1;
  }
  if (!b) {
    return -1;
  }

  return a.getTime() - b.getTime();
}

function createSorter(sort: SortOption) {
  switch (sort) {
    case 'created-asc':
      return (
        _a: TodoItem,
        _b: TodoItem,
        aIndex: number,
        bIndex: number
      ) => aIndex - bIndex;
    case 'created-desc':
      return (
        _a: TodoItem,
        _b: TodoItem,
        aIndex: number,
        bIndex: number
      ) => bIndex - aIndex;
    case 'priority-asc':
      return (a: TodoItem, b: TodoItem) => comparePriority(a.priority, b.priority);
    case 'priority-desc':
      return (a: TodoItem, b: TodoItem) => comparePriority(b.priority, a.priority);
    case 'title-asc':
      return (a: TodoItem, b: TodoItem) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
    case 'title-desc':
      return (a: TodoItem, b: TodoItem) =>
        b.title.localeCompare(a.title, undefined, { sensitivity: 'base' });
    case 'due-asc':
      return (a: TodoItem, b: TodoItem) => compareDate(a.dueDate, b.dueDate);
    case 'due-desc':
      return (a: TodoItem, b: TodoItem) => compareDate(b.dueDate, a.dueDate);
    default:
      return (
        _a: TodoItem,
        _b: TodoItem,
        aIndex: number,
        bIndex: number
      ) => bIndex - aIndex;
  }
}

export function TodoDashboard() {
  const [todos, setTodos] = useState<TodoItem[]>(seededTodos);
  const isRestoringRef = useRef(true);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [dueBeforeFilter, setDueBeforeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOption>('created-desc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreate = useCallback((todo: NewTodoInput) => {
    const nextTodo: TodoItem = {
      id:
        typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ...todo
    };

    setTodos((current) => [nextTodo, ...current]);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }, []);

  const handleUpdate = useCallback((updated: TodoItem) => {
    setTodos((current) =>
      current.map((todo) => (todo.id === updated.id ? updated : todo))
    );
  }, []);

  const filteredTodos = useMemo(() => {
    const filterDate = parseCalendarDate(dueBeforeFilter);

    const normalizedQuery = searchTerm.trim().toLowerCase();

    const filtered = todos.filter((todo) => {
      if (normalizedQuery) {
        const haystack = `${todo.title} ${todo.description}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) {
          return false;
        }
      }

      const priorityMatch =
        priorityFilter === 'all' || todo.priority === priorityFilter;

      if (!priorityMatch) {
        return false;
      }

      if (!filterDate) {
        return true;
      }

      if (!todo.dueDate) {
        return false;
      }

      const todoDate = parseCalendarDate(todo.dueDate);
      if (!todoDate) {
        return false;
      }

      return todoDate <= filterDate;
    });

    const withCreationIndex = filtered.map((todo, index) => ({
      todo,
      index
    }));

    const comparer = createSorter(sortOrder);

    return withCreationIndex
      .sort((a, b) => comparer(a.todo, b.todo, a.index, b.index))
      .map((entry) => entry.todo);
  }, [todos, priorityFilter, dueBeforeFilter, sortOrder, searchTerm]);

  const hasActiveFilters =
    priorityFilter !== 'all' ||
    dueBeforeFilter.trim() !== '' ||
    sortOrder !== 'created-desc' ||
    searchTerm.trim() !== '';

  const handlePriorityFilterChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setPriorityFilter(event.target.value as PriorityFilter);
    },
    []
  );

  const handleDueBeforeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setDueBeforeFilter(event.target.value);
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setPriorityFilter('all');
    setDueBeforeFilter('');
    setSortOrder('created-desc');
    setSearchTerm('');
  }, []);

  const handleSortChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value as SortOption);
  }, []);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    []
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      isRestoringRef.current = false;
      return;
    }

    const stored = parseStoredTodos(window.localStorage.getItem(STORAGE_KEY));
    if (stored !== null) {
      setTodos(stored);
    }
    isRestoringRef.current = false;
  }, []);

  useEffect(() => {
    if (isRestoringRef.current || typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.warn('[todo] failed to persist todos', error);
    }
  }, [todos]);

  return (
    <div className='flex flex-col gap-8'>
      <Form onCreate={handleCreate} />
      <TodoFilters
        priority={priorityFilter}
        dueBefore={dueBeforeFilter}
        sort={sortOrder}
        search={searchTerm}
        hasActiveFilters={hasActiveFilters}
        onPriorityChange={handlePriorityFilterChange}
        onDueBeforeChange={handleDueBeforeChange}
        onSortChange={handleSortChange}
        onSearchChange={handleSearchChange}
        onClear={handleClearFilters}
      />
      <TodoList
        todos={filteredTodos}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
