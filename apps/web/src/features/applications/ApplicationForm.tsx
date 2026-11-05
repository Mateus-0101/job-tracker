import { useState } from 'react';
import type { FormEvent } from 'react';
import { createApplicationSchema } from '@job-tracker/shared';
import { useCreateApplication } from './hooks';

const FIELDS = ['company', 'position', 'jobUrl', 'source'] as const;

export function ApplicationForm() {
  const create = useCreateApplication();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // campos vazios são omitidos, como o schema espera
    const raw: Record<string, string> = {};
    for (const field of FIELDS) {
      const value = String(data.get(field) ?? '').trim();
      if (value) raw[field] = value;
    }

    const parsed = createApplicationSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] ??= issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    create.mutate(parsed.data, { onSuccess: () => form.reset() });
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>
        Empresa *
        <input name="company" />
        {errors.company && <span className="error">{errors.company}</span>}
      </label>
      <label>
        Cargo *
        <input name="position" />
        {errors.position && <span className="error">{errors.position}</span>}
      </label>
      <label>
        Link da vaga
        <input name="jobUrl" placeholder="https://..." />
        {errors.jobUrl && <span className="error">{errors.jobUrl}</span>}
      </label>
      <label>
        Origem
        <input name="source" placeholder="Gupy, LinkedIn..." />
        {errors.source && <span className="error">{errors.source}</span>}
      </label>
      <button type="submit" disabled={create.isPending}>
        {create.isPending ? 'Salvando...' : 'Adicionar candidatura'}
      </button>
      {create.isError && <span className="error">{create.error.message}</span>}
    </form>
  );
}
