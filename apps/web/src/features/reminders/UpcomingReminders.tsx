import {
  useDeleteReminder,
  usePendingReminders,
  useUpdateReminder,
} from './hooks';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

export function UpcomingReminders() {
  const { data, isPending, isError, error } = usePendingReminders();
  const update = useUpdateReminder();
  const remove = useDeleteReminder();

  if (isPending) return null;
  if (isError) return <p className="error">{error.message}</p>;

  const now = new Date();

  return (
    <section className="reminders">
      <h2>Lembretes</h2>
      {data.length === 0 ? (
        <p className="muted">
          Nenhum lembrete pendente. Crie um pelo botão "＋ Lembrete" em uma
          candidatura.
        </p>
      ) : (
        <ul>
          {data.map((reminder) => {
            const overdue = new Date(reminder.dueAt) < now;
            return (
              <li
                key={reminder.id}
                className={overdue ? 'reminder overdue' : 'reminder'}
              >
                <div>
                  <strong>{reminder.title}</strong>
                  <div className="muted">
                    {reminder.application.position} ·{' '}
                    {reminder.application.company}
                  </div>
                  <small>
                    {overdue ? 'Venceu em ' : 'Até '}
                    {formatDate(reminder.dueAt)}
                  </small>
                </div>
                <div className="reminder-actions">
                  <button
                    onClick={() =>
                      update.mutate({ id: reminder.id, data: { done: true } })
                    }
                  >
                    Concluir
                  </button>
                  <button
                    className="danger"
                    onClick={() => remove.mutate(reminder.id)}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
