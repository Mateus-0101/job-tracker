import { APPLICATION_STATUSES } from '@job-tracker/shared';
import type { ApplicationStatus } from '@job-tracker/shared';
import {
  useApplications,
  useDeleteApplication,
  useUpdateStatus,
} from './hooks';
import { STATUS_LABELS } from './status';

export function ApplicationList() {
  const { data, isPending, isError, error } = useApplications();
  const updateStatus = useUpdateStatus();
  const remove = useDeleteApplication();

  if (isPending) return <p>Carregando...</p>;
  if (isError) return <p className="error">{error.message}</p>;
  if (data.length === 0) return <p>Nenhuma candidatura ainda.</p>;

  return (
    <ul className="list">
      {data.map((application) => (
        <li key={application.id} className="card">
          <div>
            <strong>{application.position}</strong>
            <div>{application.company}</div>
            <small>
              {application.source ? `${application.source} · ` : ''}
              {new Date(application.appliedAt).toLocaleDateString('pt-BR')}
            </small>
          </div>
          <div className="actions">
            <select
              value={application.status}
              onChange={(e) =>
                updateStatus.mutate({
                  id: application.id,
                  status: e.target.value as ApplicationStatus,
                })
              }
            >
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <button onClick={() => remove.mutate(application.id)}>Remover</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
