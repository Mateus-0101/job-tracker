import { ApplicationForm } from './features/applications/ApplicationForm';
import { KanbanBoard } from './features/applications/KanbanBoard';

export default function App() {
  return (
    <main className="container">
      <h1>Job Tracker</h1>
      <ApplicationForm />
      <KanbanBoard />
    </main>
  );
}
