'use client';

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
] as const;

type Priority = (typeof priorities)[number]['value'];

const quickTips = [
  {
    label: 'Title',
    title: 'Lead with an action',
    body: 'Kick off titles with verbs so future-you knows exactly what to do next.'
  },
  {
    label: 'Notes',
    title: 'Add context that speeds you up later',
    body: 'Drop links, bullet points, or reminders to make the task easier to finish.'
  },
  {
    label: 'Due date',
    title: 'Ground it in your timeline',
    body: "Pick a day you can commit to. We'll surface nudges as the date nears."
  },
  {
    label: 'Priority',
    title: 'Match it with your energy',
    body: "Save High for blockers, Medium for today's focus, and Low for later ideas."
  }
] as const;

interface FormValues {
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
}

const initialValues: FormValues = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium'
};

export function Form() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>(
    'idle'
  );
  const [lastCreated, setLastCreated] = useState<{
    title: string;
    priority: Priority;
    dueDate?: string;
  } | null>(null);
  const submitTimeoutRef = useRef<number | null>(null);
  const idleTimeoutRef = useRef<number | null>(null);

  const minDueDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timezoneOffset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - timezoneOffset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  }, []);

  const isSubmitting = status === 'submitting';
  const isSuccess = status === 'success';

  function handleChange(key: keyof FormValues) {
    return (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { value } = event.target;
      setValues((current) => ({ ...current, [key]: value }));
      if (errors[key]) {
        setErrors((current) => ({ ...current, [key]: undefined }));
      }
    };
  }

  function validate(current: FormValues) {
    const nextErrors: Partial<Record<keyof FormValues, string>> = {};
    const trimmedTitle = current.title.trim();

    if (!trimmedTitle) {
      nextErrors.title = 'Give your todo a name.';
    } else if (trimmedTitle.length < 3) {
      nextErrors.title = 'Make it at least 3 characters to keep things clear.';
    }

    if (current.dueDate) {
      const [year, month, day] = current.dueDate.split('-').map(Number);
      const selected = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        nextErrors.dueDate = 'Choose today or a future date.';
      }
    }

    return nextErrors;
  }

  function resetForm() {
    setValues(initialValues);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const validation = validate(values);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setErrors({});
    setStatus('submitting');

    if (submitTimeoutRef.current) {
      window.clearTimeout(submitTimeoutRef.current);
    }
    if (idleTimeoutRef.current) {
      window.clearTimeout(idleTimeoutRef.current);
    }

    submitTimeoutRef.current = window.setTimeout(() => {
      const createdTodo = {
        title: values.title.trim(),
        description: values.description.trim(),
        priority: values.priority,
        dueDate: values.dueDate || undefined
      };

      // Surface the captured todo in the console until persistence lands
      console.log('[todo] created', createdTodo);

      setStatus('success');
      setLastCreated({
        title: createdTodo.title,
        priority: createdTodo.priority,
        dueDate: createdTodo.dueDate
      });
      resetForm();

      idleTimeoutRef.current = window.setTimeout(() => {
        setStatus('idle');
        idleTimeoutRef.current = null;
      }, 2600);
      submitTimeoutRef.current = null;
    }, 700);
  }

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        window.clearTimeout(submitTimeoutRef.current);
      }
      if (idleTimeoutRef.current) {
        window.clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form
      className='glass-panel overflow-hidden'
      onSubmit={handleSubmit}
      noValidate
    >
      <div className='relative z-10 flex flex-col gap-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <span className='badge'>New</span>
            <h2 className='mt-4 text-2xl font-semibold sm:text-3xl'>
              Create a todo
            </h2>
            <p className='text-subtle mt-2 max-w-xl text-sm sm:text-base'>
              Capture what needs to happen next. Add a title, give it context,
              and we&apos;ll help you prioritise once the rest of the app comes
              alive.
            </p>
          </div>
          {isSuccess && lastCreated ? (
            <div className='form-success' role='status' aria-live='polite'>
              <span aria-hidden>&#10003;</span>
              <span>
                <span className='font-semibold'>{lastCreated.title}</span> is
                queued under {lastCreated.priority} priority
                {lastCreated.dueDate
                  ? ` for ${new Date(lastCreated.dueDate).toLocaleDateString()}`
                  : ''}
                .
              </span>
            </div>
          ) : null}
        </div>

        <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-start'>
          <div className='flex flex-col gap-6'>
            <div className='form-layout'>
              <div className='form-field'>
                <label className='form-label' htmlFor='todo-title'>
                  Title
                </label>
                <input
                  id='todo-title'
                  name='title'
                  className='form-input'
                  placeholder='Write the task in a sentence'
                  value={values.title}
                  onChange={handleChange('title')}
                  aria-invalid={errors.title ? 'true' : undefined}
                  aria-describedby={
                    errors.title ? 'todo-title-error' : undefined
                  }
                  autoComplete='off'
                  required
                />
                {errors.title ? (
                  <p className='form-error' id='todo-title-error' role='alert'>
                    {errors.title}
                  </p>
                ) : (
                  <p className='form-helper'>Keep it short but intentional.</p>
                )}
              </div>

              <div className='form-field'>
                <label className='form-label' htmlFor='todo-notes'>
                  Notes
                </label>
                <textarea
                  id='todo-notes'
                  name='description'
                  className='form-textarea'
                  placeholder='Add context, links, or a checklist for future you'
                  value={values.description}
                  onChange={handleChange('description')}
                  aria-describedby='todo-notes-helper'
                />
                <p className='form-helper' id='todo-notes-helper'>
                  Rich editing is coming soon -- for now, jot quick context to
                  stay sharp.
                </p>
              </div>

              <div className='form-layout sm:grid-cols-2'>
                <div className='form-field'>
                  <label className='form-label' htmlFor='todo-due-date'>
                    Due date
                  </label>
                  <input
                    id='todo-due-date'
                    name='dueDate'
                    className='form-input'
                    type='date'
                    min={minDueDate}
                    value={values.dueDate}
                    onChange={handleChange('dueDate')}
                    aria-invalid={errors.dueDate ? 'true' : undefined}
                    aria-describedby={
                      errors.dueDate
                        ? 'todo-due-date-error'
                        : 'todo-due-date-helper'
                    }
                  />
                  {errors.dueDate ? (
                    <p
                      className='form-error'
                      id='todo-due-date-error'
                      role='alert'
                    >
                      {errors.dueDate}
                    </p>
                  ) : (
                    <p className='form-helper' id='todo-due-date-helper'>
                      Optional, but we&apos;ll nudge you as deadlines come
                      close.
                    </p>
                  )}
                </div>

                <div className='form-field'>
                  <label className='form-label' htmlFor='todo-priority'>
                    Priority
                  </label>
                  <select
                    id='todo-priority'
                    name='priority'
                    className='form-select'
                    value={values.priority}
                    onChange={handleChange('priority')}
                  >
                    {priorities.map((option) => (
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
              <p className='text-subtle text-sm'>
                Submitting will soon sync with your calendar, daily focus, and
                notifications.
              </p>
              <button
                className='button-primary'
                type='submit'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add todo'}
              </button>
            </div>
          </div>

          <aside className='surface-hint'>
            <div>
              <p className='text-subtle text-xs font-semibold uppercase tracking-[0.35em]'>
                Field guide
              </p>
              <h3 className='mt-2 text-lg font-semibold'>
                Make each todo self-explanatory
              </h3>
            </div>
            <ul className='form-checklist'>
              {quickTips.map((tip) => (
                <li key={tip.label}>
                  <div>
                    <p className='text-subtle text-[0.7rem] font-semibold uppercase tracking-[0.35em]'>
                      {tip.label}
                    </p>
                    <p className='mt-1 text-sm font-semibold'>{tip.title}</p>
                    <p className='text-subtle mt-1 text-sm leading-relaxed'>
                      {tip.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className='text-subtle text-xs uppercase tracking-[0.28em]'>
              Coming soon: smart templates for routines.
            </p>
          </aside>
        </div>
      </div>
    </form>
  );
}
