import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './app/providers/queryClient';
import RequireAuth from './app/RequireAuth';
import SignupPage from './pages/signup/SignupPage';
import LoginPage from './pages/login/LoginPage';
import TodoListPage from './pages/todo-list/TodoListPage';
import TodoFormPage from './pages/todo-form/TodoFormPage';
import CategoryPage from './pages/category/CategoryPage';
import ProfilePage from './pages/profile/ProfilePage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/todos" element={<TodoListPage />} />
            <Route path="/todos/new" element={<TodoFormPage />} />
            <Route path="/todos/:id/edit" element={<TodoFormPage />} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
