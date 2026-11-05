import { ApplicationForm } from './features/applications/ApplicationForm';
import { KanbanBoard } from './features/applications/KanbanBoard';
import { useCurrentUser, useLogout } from './features/auth/hooks';
import { LoginScreen } from './features/auth/LoginScreen';

export default function App() {
  const { data: user, isPending, isError, error } = useCurrentUser();
  const logout = useLogout();

  if (isPending) return <p className="container">Carregando...</p>;
  if (isError) return <p className="container error">{error.message}</p>;
  if (!user) return <LoginScreen />;

  return (
    <main className="container">
      <header className="topbar">
        <h1>Job Tracker</h1>
        <div className="user">
          <span>{user.name ?? user.email}</span>
          <button onClick={() => logout.mutate()}>Sair</button>
        </div>
      </header>
      <ApplicationForm />
      <KanbanBoard />
    </main>
  );
}
