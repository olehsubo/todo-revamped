'use client';

import { useCallback, useState } from 'react';

import { Form } from '@/components/form';
import { TodoList, seededTodos, type TodoItem } from '@/components/todo-list';

type NewTodoInput = Omit<TodoItem, 'id'>;

export function TodoDashboard() {
  const [todos, setTodos] = useState<TodoItem[]>(seededTodos);

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

  return (
    <div className='flex flex-col gap-8'>
      <Form onCreate={handleCreate} />
      <TodoList todos={todos} onDelete={handleDelete} onUpdate={handleUpdate} />
    </div>
  );
}
