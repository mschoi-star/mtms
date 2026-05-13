import { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { DesktopShell } from './pages/DesktopShell';
import { getStoredUser, clearSession } from './services/api';
import type { User } from './types';

function restoreUser(): User | null {
  const stored = getStoredUser();
  if (!stored) return null;
  return { id: stored.id, name: stored.name, remember: true };
}

function App() {
  const [user, setUser] = useState<User | null>(restoreUser);

  const handleSignOut = () => {
    clearSession();
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={(u) => setUser(u)} />;
  }

  return <DesktopShell user={user} onSignOut={handleSignOut} />;
}

export default App;
