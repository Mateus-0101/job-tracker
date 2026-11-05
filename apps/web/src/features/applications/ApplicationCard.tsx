import { useDraggable } from '@dnd-kit/core';
import { APPLICATION_STATUSES } from '@job-tracker/shared';
import type { Application, ApplicationStatus } from '@job-tracker/shared';
import type { ReactNode } from 'react';
import { AddReminder } from '../reminders/AddReminder';
import { useDeleteApplication, useUpdateStatus } from './hooks';
import { STATUS_LABELS } from './status';

interface ApplicationCardProps {
  application: Application;
  dragHandle?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
}

export function ApplicationCard({
  application,
  dragHandle,
  actions,
  footer,
}: ApplicationCardProps) {
  return (
    <article className="card">
      <div className="card-top">
        <div>
          <strong>{application.position}</strong>
          <div>{application.company}</div>
          <small>
            {application.source ? `${application.source} · ` : ''}
            {new Date(application.appliedAt).toLocaleDateString('pt-BR')}
          </small>
        </div>
        {dragHandle}
      </div>
      {actions && <div className="card-actions">{actions}</div>}
      {footer && <div className="card-footer">{footer}</div>}
    </article>
  );
}

export function DraggableCard({ application }: { application: Application }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useDraggable({ id: application.id });
  const updateStatus = useUpdateStatus();
  const remove = useDeleteApplication();

  return (
    <div ref={setNodeRef} className={isDragging ? 'dragging' : undefined}>
      <ApplicationCard
        application={application}
        dragHandle={
          <button
            ref={setActivatorNodeRef}
            className="handle"
            aria-label="Arrastar candidatura"
            {...attributes}
            {...listeners}
          >
            ⠿
          </button>
        }
        actions={
          <>
            <select
              aria-label="Mudar status"
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
            <button
              className="danger"
              onClick={() => remove.mutate(application.id)}
            >
              Remover
            </button>
          </>
        }
        footer={<AddReminder applicationId={application.id} />}
      />
    </div>
  );
}
