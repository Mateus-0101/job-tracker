import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  APPLICATION_STATUSES,
  applicationStatusSchema,
} from '@job-tracker/shared';
import { ApplicationCard } from './ApplicationCard';
import { useApplications, useUpdateStatus } from './hooks';
import { KanbanColumn } from './KanbanColumn';

export function KanbanBoard() {
  const { data, isPending, isError, error } = useApplications();
  const updateStatus = useUpdateStatus();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  if (isPending) return <p>Carregando...</p>;
  if (isError) return <p className="error">{error.message}</p>;

  const activeApplication = data.find((a) => a.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const target = applicationStatusSchema.safeParse(over.id);
    if (!target.success) return;

    const application = data?.find((a) => a.id === active.id);
    if (!application || application.status === target.data) return;

    updateStatus.mutate({ id: application.id, status: target.data });
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="board">
        {APPLICATION_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={data.filter((a) => a.status === status)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeApplication ? (
          <div className="overlay">
            <ApplicationCard application={activeApplication} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
