'use client';

import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useMemo,
  useState
} from 'react';

export type TodoItem = {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
};

export const seededTodos: TodoItem[] = [
  {
    id: '1',
    title: 'Draft the product launch outline',
    description:
      'Collect talking points, outline the launch email, and gather supporting assets.',
    priority: 'high',
    dueDate: '2025-10-12'
  },
  {
    id: '2',
    title: 'Plan next sprint goals',
    description:
      'Review current progress, identify blockers, and pick top 3 focus areas for the week.',
    priority: 'medium',
    dueDate: '2025-11-15'
  },
  {
    id: '3',
    title: 'Refresh knowledge base',
    description:
      'Update onboarding docs with the latest workflow tips gathered from the team retro.',
    priority: 'low'
  }
];

const priorityOptions: Array<{
  value: TodoItem['priority'];
  label: string;
}> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const PRIORITY_STYLES: Record<TodoItem['priority'], string> = {
  high: 'bg-red-500/15 text-red-600 dark:bg-red-500/10 dark:text-red-300',
  medium:
    'bg-[var(--accent-soft)] text-[var(--accent-gradient-end)] dark:text-[var(--accent-foreground)]',
  low: 'bg-slate-500/10 text-slate-600 dark:bg-slate-400/10 dark:text-slate-200'
};

function formatDueDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

type TodoDraft = {
  title: string;
  description: string;
  priority: TodoItem['priority'];
  dueDate: string;
};

type DraftErrors = {
  title?: string;
  dueDate?: string;
};

function getMinDueDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const timezoneOffset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - timezoneOffset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
}

function validateDraft(draft: TodoDraft): DraftErrors {
  const errors: DraftErrors = {};
  const trimmedTitle = draft.title.trim();

  if (!trimmedTitle) {
    errors.title = 'Give your todo a name.';
  } else if (trimmedTitle.length < 3) {
    errors.title = 'Make it at least 3 characters to keep things clear.';
  }

  if (draft.dueDate) {
    const [year, month, day] = draft.dueDate.split('-').map(Number);
    const selected = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      errors.dueDate = 'Choose today or a future date.';
    }
  }

  return errors;
}

interface TodoListProps {
  todos?: TodoItem[];
  onDelete?: (id: string) => void;
  onUpdate?: (todo: TodoItem) => void;
}

export function TodoList({
  todos = seededTodos,
  onDelete,
  onUpdate
}: TodoListProps) {
  const hasTodos = todos.length > 0;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TodoDraft | null>(null);
  const [draftErrors, setDraftErrors] = useState<DraftErrors>({});

  const minDueDate = useMemo(() => getMinDueDate(), []);

  const resetEditing = useCallback(() => {
    setEditingId(null);
    setDraft(null);
    setDraftErrors({});
  }, []);

  const startEditing = useCallback((todo: TodoItem) => {
    setEditingId(todo.id);
    setDraft({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      dueDate: todo.dueDate ?? ''
    });
    setDraftErrors({});
  }, []);

  const handleDraftChange = useCallback(
    (field: keyof TodoDraft) =>
      (
        event: ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) => {
        const { value } = event.target;
        setDraft((current) =>
          current ? { ...current, [field]: value } : current
        );
        if (field === 'title' || field === 'dueDate') {
          setDraftErrors((current) => {
            if (!current[field]) {
              return current;
            }
            const next = { ...current };
            delete next[field];
            return next;
          });
        }
      },
    []
  );

  const handleEditSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>, currentTodo: TodoItem) => {
      event.preventDefault();
      if (!draft) {
        return;
      }

      const validation = validateDraft(draft);
      if (Object.keys(validation).length > 0) {
        setDraftErrors(validation);
        return;
      }

      const trimmedTitle = draft.title.trim();
      const updatedTodo: TodoItem = {
        ...currentTodo,
        title: trimmedTitle,
        description: draft.description.trim(),
        priority: draft.priority,
        dueDate: draft.dueDate ? draft.dueDate : undefined
      };

      onUpdate?.(updatedTodo);
      resetEditing();
    },
    [draft, onUpdate, resetEditing]
  );

  return (
    <section className='glass-panel flex flex-col gap-8'>
      <header>
        <span className='badge'>Todos</span>
        <h2 className='mt-4 text-2xl font-semibold sm:text-3xl'>
          Your running list
        </h2>
        <p className='text-subtle mt-2 max-w-2xl text-sm sm:text-base'>
          Every captured task appears here instantly. Until persistence arrives,
          explore the seeded samples or add your own above.
        </p>
      </header>

      <ul className='flex flex-col gap-4'>
        {hasTodos ? (
          todos.map((todo) => {
            const dueDate = formatDueDate(todo.dueDate);
            const isEditing = editingId === todo.id;
            const currentDraft = isEditing && draft ? draft : null;
            const showDueBadge = Boolean(dueDate && !isEditing);
            return (
              <li
                key={todo.id}
                className='border-subtle-strong group relative rounded-2xl border bg-[var(--surface-panel)] p-6 transition duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-32px_var(--shadow-soft)]'
              >
                {showDueBadge ? (
                  <>
                    <div className='border-subtle mb-4 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-subtle sm:hidden'>
                      <span>Due</span>
                      <span className='text-[color:var(--foreground)] tracking-normal'>
                        {dueDate}
                      </span>
                    </div>
                    <div className='border-subtle absolute right-6 top-6 hidden items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-subtle sm:inline-flex'>
                      <span>Due</span>
                      <span className='text-[color:var(--foreground)] tracking-normal'>
                        {dueDate}
                      </span>
                    </div>
                  </>
                ) : null}
                {isEditing && currentDraft ? (
                  <form
                    className='flex flex-col gap-6'
                    onSubmit={(event) => handleEditSubmit(event, todo)}
                  >
                    <div className='form-layout'>
                      <div className='form-field'>
                        <label
                          className='form-label'
                          htmlFor={`todo-edit-title-${todo.id}`}
                        >
                          Title
                        </label>
                        <input
                          id={`todo-edit-title-${todo.id}`}
                          className='form-input'
                          value={currentDraft.title}
                          onChange={handleDraftChange('title')}
                          aria-invalid={draftErrors.title ? 'true' : undefined}
                          aria-describedby={
                            draftErrors.title
                              ? `todo-edit-title-${todo.id}-error`
                              : `todo-edit-title-${todo.id}-helper`
                          }
                          autoComplete='off'
                          required
                        />
                        {draftErrors.title ? (
                          <p
                            className='form-error'
                            id={`todo-edit-title-${todo.id}-error`}
                            role='alert'
                          >
                            {draftErrors.title}
                          </p>
                        ) : (
                          <p
                            className='form-helper'
                            id={`todo-edit-title-${todo.id}-helper`}
                          >
                            Keep it short but intentional.
                          </p>
                        )}
                      </div>

                      <div className='form-field'>
                        <label
                          className='form-label'
                          htmlFor={`todo-edit-notes-${todo.id}`}
                        >
                          Notes
                        </label>
                        <textarea
                          id={`todo-edit-notes-${todo.id}`}
                          className='form-textarea'
                          value={currentDraft.description}
                          onChange={handleDraftChange('description')}
                          aria-describedby={`todo-edit-notes-${todo.id}-helper`}
                        />
                        <p
                          className='form-helper'
                          id={`todo-edit-notes-${todo.id}-helper`}
                        >
                          Add or tweak the context to stay sharp.
                        </p>
                      </div>

                      <div className='form-layout sm:grid-cols-2'>
                        <div className='form-field'>
                          <label
                            className='form-label'
                            htmlFor={`todo-edit-due-${todo.id}`}
                          >
                            Due date
                          </label>
                          <input
                            id={`todo-edit-due-${todo.id}`}
                            className='form-input'
                            type='date'
                            min={minDueDate}
                            value={currentDraft.dueDate}
                            onChange={handleDraftChange('dueDate')}
                            aria-invalid={
                              draftErrors.dueDate ? 'true' : undefined
                            }
                            aria-describedby={
                              draftErrors.dueDate
                                ? `todo-edit-due-${todo.id}-error`
                                : `todo-edit-due-${todo.id}-helper`
                            }
                          />
                          {draftErrors.dueDate ? (
                            <p
                              className='form-error'
                              id={`todo-edit-due-${todo.id}-error`}
                              role='alert'
                            >
                              {draftErrors.dueDate}
                            </p>
                          ) : (
                            <p
                              className='form-helper'
                              id={`todo-edit-due-${todo.id}-helper`}
                            >
                              Optional, but we&apos;ll nudge you as deadlines
                              come close.
                            </p>
                          )}
                        </div>

                        <div className='form-field'>
                          <label
                            className='form-label'
                            htmlFor={`todo-edit-priority-${todo.id}`}
                          >
                            Priority
                          </label>
                          <select
                            id={`todo-edit-priority-${todo.id}`}
                            className='form-select'
                            value={currentDraft.priority}
                            onChange={handleDraftChange('priority')}
                          >
                            {priorityOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <p className='form-helper'>
                            Medium keeps it balanced. Crank it to High when it
                            can&apos;t slip.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                      {onDelete ? (
                        <button
                          type='button'
                          className='action-button action-button--danger'
                          onClick={() => onDelete(todo.id)}
                          aria-label={`Delete todo ${todo.title}`}
                        >
                          Delete
                        </button>
                      ) : (
                        <span />
                      )}
                      <div className='flex items-center gap-3 self-end sm:self-auto'>
                        <button
                          type='button'
                          className='action-button'
                          onClick={resetEditing}
                        >
                          Cancel
                        </button>
                        <button
                          className='button-primary px-6 py-2 text-sm font-semibold'
                          type='submit'
                        >
                          Save changes
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                    <div className='flex flex-col gap-3 sm:pr-28'>
                      <div className='flex flex-wrap items-center gap-3'>
                        <h3 className='text-lg font-semibold sm:text-xl'>
                          {todo.title}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.32em] ${
                            PRIORITY_STYLES[todo.priority]
                          }`}
                        >
                          {todo.priority}
                        </span>
                      </div>
                      <p className='text-subtle text-sm leading-relaxed sm:text-base'>
                        {todo.description}
                      </p>
                    </div>
                    <div className='flex items-center gap-3 self-start sm:self-end'>
                      {onUpdate ? (
                        <button
                          type='button'
                          className='action-button'
                          onClick={() => startEditing(todo)}
                          aria-label={`Edit todo ${todo.title}`}
                        >
                          Edit
                        </button>
                      ) : null}
                      {onDelete ? (
                        <button
                          type='button'
                          className='action-button action-button--danger'
                          onClick={() => onDelete(todo.id)}
                          aria-label={`Delete todo ${todo.title}`}
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}
              </li>
            );
          })
        ) : (
          <li className='border-subtle-strong rounded-2xl border bg-[var(--surface-panel)] p-6 text-sm text-subtle'>
            You&apos;re all caught up. Add a new todo above to keep the momentum
            going.
          </li>
        )}
      </ul>
    </section>
  );
}
