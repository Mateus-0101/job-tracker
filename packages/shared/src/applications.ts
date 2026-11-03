import { z } from 'zod';

export const APPLICATION_STATUSES = [
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'TECHNICAL_TEST',
  'OFFER',
  'REJECTED',
] as const;

export const applicationStatusSchema = z.enum(APPLICATION_STATUSES);
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

export const createApplicationSchema = z.object({
  company: z.string().trim().min(1).max(120),
  position: z.string().trim().min(1).max(120),
  jobUrl: z.url().optional(),
  source: z.string().trim().max(60).optional(),
  status: applicationStatusSchema.optional(),
  appliedAt: z.coerce.date().optional(),
  notes: z.string().max(2000).optional(),
});
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export const updateApplicationSchema = createApplicationSchema.partial();
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

export const updateStatusSchema = z.object({
  status: applicationStatusSchema,
});
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

export const listApplicationsQuerySchema = z.object({
  status: applicationStatusSchema.optional(),
});
export type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;