import { ThemeToggle } from '@/components/theme-toggle';
import { TodoDashboard } from '@/components/todo-dashboard';

export default function Home() {
  return (
    <div className='mx-auto flex min-h-screen max-w-4xl flex-col gap-12 px-6 py-10'>
      <header className='flex items-center justify-between'>
        <div>
          <p className='text-subtle text-sm font-medium uppercase tracking-[0.2em]'>
            Todo Revamped
          </p>
          <h1 className='mt-2 text-3xl font-semibold sm:text-4xl'>
            Stay on top of what matters today.
          </h1>
        </div>
        <ThemeToggle />
      </header>

      <main className='flex flex-1 flex-col justify-center gap-8'>
        <p className='text-subtle max-w-2xl text-lg'>
          Your tasks, calendar, and focus tools will live here. Start by
          capturing a todo with the creation sheet below.
        </p>
        <TodoDashboard />
      </main>

      <footer className='border-subtle flex flex-col gap-2 border-t pt-6 text-subtle text-sm sm:flex-row sm:items-center sm:justify-between'>
        <p>&copy; {new Date().getFullYear()} Todo Revamped.</p>
        <p>Modern productivity.</p>
      </footer>
    </div>
  );
}
