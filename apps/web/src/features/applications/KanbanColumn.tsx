import { useDroppable } from '@dnd-kit/core';
import type { Application, ApplicationStatus } from '@job-tracker/shared';
import { DraggableCard } from './ApplicationCard';
import { STATUS_LABELS } from './status';

interface KanbanColumnProps {
  status: ApplicationStatus;
  applications: Application[];
}

export function KanbanColumn({ status, applications }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={isOver ? 'column column-over' : 'column'}
    >
      <header className="column-header">
        <h2>{STATUS_LABELS[status]}</h2>
        <span className="count">{applications.length}</span>
      </header>
      <div className="column-body">
        {applications.map((application) => (
          <DraggableCard key={application.id} application={application} />
        ))}
      </div>
    </section>
  );
}
