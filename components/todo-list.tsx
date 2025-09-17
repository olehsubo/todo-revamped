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
    dueDate: '2025-07-12'
  },
  {
    id: '2',
    title: 'Plan next sprint goals',
    description:
      'Review current progress, identify blockers, and pick top 3 focus areas for the week.',
    priority: 'medium',
    dueDate: '2025-07-15'
  },
  {
    id: '3',
    title: 'Refresh knowledge base',
    description:
      'Update onboarding docs with the latest workflow tips gathered from the team retro.',
    priority: 'low'
  }
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

interface TodoListProps {
  todos?: TodoItem[];
  onDelete?: (id: string) => void;
}

export function TodoList({ todos = seededTodos, onDelete }: TodoListProps) {
  const hasTodos = todos.length > 0;

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
            return (
              <li
                key={todo.id}
                className='border-subtle-strong group relative rounded-2xl border bg-[var(--surface-panel)] p-6 transition duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-32px_var(--shadow-soft)]'
              >
                {dueDate ? (
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
                    {onDelete ? (
                      <button
                        type='button'
                        className='text-subtle text-xs font-semibold uppercase tracking-[0.28em] transition hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gradient-end)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]'
                        onClick={() => onDelete(todo.id)}
                        aria-label={`Delete todo ${todo.title}`}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
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
