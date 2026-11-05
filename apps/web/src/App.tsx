import { ApplicationForm } from './features/applications/ApplicationForm';
import { ApplicationList } from './features/applications/ApplicationList';

export default function App() {
  return (
    <main className="container">
      <h1>Job Tracker</h1>
      <ApplicationForm />
      <ApplicationList />
    </main>
  );
}
