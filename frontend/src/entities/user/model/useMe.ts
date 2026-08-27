import { useQuery } from '@tanstack/react-query';
import { fetchMe } from '../api/userApi';

export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: fetchMe });
}
