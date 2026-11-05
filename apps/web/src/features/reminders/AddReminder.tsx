import { useState } from 'react';
import type { FormEvent } from 'react';
import { createReminderSchema } from '@job-tracker/shared';
import { useCreateReminder } from './hooks';

export function AddReminder({ applicationId }: { applicationId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const create = useCreateReminder();

  if (!open) {
    return (
      <button className="link" onClick={() => setOpen(true)}>
        ＋ Lembrete
      </button>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const parsed = createReminderSchema.safeParse({
      title: String(data.get('title') ?? ''),
      dueAt: String(data.get('dueAt') ?? ''),
    });
    if (!parsed.success) {
      setError('Informe um título e uma data válida.');
      return;
    }

    setError(null);
    create.mutate(
      { applicationId, input: parsed.data },
      {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
      },
    );
  }

  return (
    <form className="reminder-form" onSubmit={handleSubmit}>
      <input name="title" placeholder="Ex.: Follow-up com o recrutador" />
      <input name="dueAt" type="datetime-local" />
      {error && <span className="error">{error}</span>}
      {create.isError && <span className="error">{create.error.message}</span>}
      <div className="reminder-form-actions">
        <button type="submit" disabled={create.isPending}>
          Salvar
        </button>
        <button type="button" className="danger" onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
