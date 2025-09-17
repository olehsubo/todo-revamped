'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Form } from '@/components/form';
import { TodoList, seededTodos, type TodoItem } from '@/components/todo-list';

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

export function TodoDashboard() {
  const [todos, setTodos] = useState<TodoItem[]>(seededTodos);
  const isRestoringRef = useRef(true);

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
      <TodoList todos={todos} onDelete={handleDelete} onUpdate={handleUpdate} />
    </div>
  );
}
