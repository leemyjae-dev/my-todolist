import { create } from 'zustand';
import type { TodoStatus } from '../../../entities/todo/model/todo.types';

interface FilterState {
  categoryId?: string;
  status?: TodoStatus;
  page: number;
  setCategoryId: (id?: string) => void;
  setStatus: (status?: TodoStatus) => void;
  setPage: (page: number) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  categoryId: undefined,
  status: undefined,
  page: 1,
  setCategoryId: (id) => set({ categoryId: id, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setPage: (page) => set({ page }),
}));
