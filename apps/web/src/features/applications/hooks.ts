import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Application,
  ApplicationStatus,
  CreateApplicationInput,
} from '@job-tracker/shared';
import { request } from '../../lib/api';

const KEY = ['applications'];

export function useApplications() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => request<Application[]>('/applications'),
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateApplicationInput) =>
      request<Application>('/applications', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      request<Application>(`/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    // atualiza a tela antes da resposta da API
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<Application[]>(KEY);
      queryClient.setQueryData<Application[]>(KEY, (old) =>
        old?.map((a) => (a.id === id ? { ...a, status } : a)),
      );
      return { previous };
    },
    // se a API falhar, volta ao estado anterior
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous);
    },
    // no fim, sincroniza com o que está de fato no servidor
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      request<void>(`/applications/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
