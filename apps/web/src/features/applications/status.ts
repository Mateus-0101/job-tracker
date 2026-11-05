import type { ApplicationStatus } from '@job-tracker/shared';

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: 'Aplicada',
  SCREENING: 'Em triagem',
  INTERVIEW: 'Entrevista',
  TECHNICAL_TEST: 'Teste técnico',
  OFFER: 'Oferta',
  REJECTED: 'Recusada',
};
