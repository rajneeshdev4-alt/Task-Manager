import { Route, Routes } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { NotFound } from '../pages/NotFound';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
