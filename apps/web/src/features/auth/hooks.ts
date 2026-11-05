import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, request } from '../../lib/api';

export interface User {
  id: string;
  email: string;
  name: string | null;
}

const ME_KEY = ['me'];

export function useCurrentUser() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: async () => {
      try {
        return await request<User>('/auth/me');
      } catch (error) {
        // 401 significa "sem sessão": não é um erro da tela, é o estado deslogado
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => request<void>('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.setQueryData(ME_KEY, null);
      queryClient.removeQueries({ queryKey: ['applications'] });
    },
  });
}
