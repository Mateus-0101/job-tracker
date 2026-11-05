import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateReminderInput,
  Reminder,
  UpdateReminderInput,
} from '@job-tracker/shared';
import { request } from '../../lib/api';

const KEY = ['reminders'];

export function usePendingReminders() {
  return useQuery({
    queryKey: [...KEY, 'pending'],
    queryFn: () => request<Reminder[]>('/reminders?done=false'),
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationId,
      input,
    }: {
      applicationId: string;
      input: CreateReminderInput;
    }) =>
      request<Reminder>(`/applications/${applicationId}/reminders`, {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReminderInput }) =>
      request<Reminder>(`/reminders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      request<void>(`/reminders/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
