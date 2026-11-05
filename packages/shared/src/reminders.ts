import { z } from 'zod';

export const createReminderSchema = z.object({
  title: z.string().trim().min(1).max(160),
  dueAt: z.coerce.date(),
});
export type CreateReminderInput = z.infer<typeof createReminderSchema>;

export const updateReminderSchema = createReminderSchema
  .partial()
  .extend({ done: z.boolean().optional() });
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;

export const listRemindersQuerySchema = z.object({
  done: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});
export type ListRemindersQuery = z.infer<typeof listRemindersQuerySchema>;

// formato devolvido pela API (datas chegam como string no JSON)
export interface Reminder {
  id: string;
  applicationId: string;
  title: string;
  dueAt: string;
  done: boolean;
  createdAt: string;
  application: { id: string; company: string; position: string };
}
