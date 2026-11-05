import { API_URL } from '../../lib/api';

export function LoginScreen() {
  return (
    <div className="login">
      <h1>Job Tracker</h1>
      <p>Acompanhe suas candidaturas em um só lugar.</p>
      <a className="login-button" href={`${API_URL}/auth/google`}>
        Entrar com Google
      </a>
    </div>
  );
}
