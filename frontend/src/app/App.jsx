import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from './router';
import { TaskProvider } from '../features/tasks/context/TaskContext';

export function App() {
  return (
    <BrowserRouter>
      <TaskProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
            },
          }}
        />
      </TaskProvider>
    </BrowserRouter>
  );
}
