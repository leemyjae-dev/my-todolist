import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../api/categoryApi';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
}
