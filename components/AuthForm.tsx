// components/AuthForm.tsx
import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import { ViewMode, User } from '../types';

interface AuthFormProps {
  viewMode: ViewMode.LOGIN | ViewMode.REGISTER;
  onSwitchView: (mode: ViewMode.LOGIN | ViewMode.REGISTER) => void;
  onLogin: (username: string) => void;
  onRegister: (username: string) => void;
  loadUsers: () => Map<string, User>;
  saveUsers: (users: Map<string, User>) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  viewMode,
  onSwitchView,
  onLogin,
  onRegister,
  loadUsers,
  saveUsers,
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const users = loadUsers();

    if (viewMode === ViewMode.LOGIN) {
      const user = users.get(username);
      if (user && user.passwordHash === password) { // Simple plaintext comparison for demo
        onLogin(username);
      } else {
        setError('Invalid username or password.');
      }
    } else { // ViewMode.REGISTER
      if (users.has(username)) {
        setError('Username already taken.');
      } else if (password.length < 3) { // Simple password strength check
        setError('Password must be at least 3 characters long.');
      } else {
        const newUser: User = { username, passwordHash: password }; // Storing plaintext for demo
        users.set(username, newUser);
        saveUsers(users);
        setSuccessMessage('Registration successful! Logging in...');
        setTimeout(() => onRegister(username), 1500); // Simulate brief delay before login
      }
    }
  };

  const isLogin = viewMode === ViewMode.LOGIN;

  return (
    <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl w-full max-w-sm mx-auto text-center border-4 border-white">
      <h2 className="text-4xl font-extrabold mb-6 text-indigo-900">
        {isLogin ? 'Welcome Back!' : 'Join the Fun!'}
      </h2>
      <form onSubmit={handleAuth} className="space-y-6">
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          aria-label="Username"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          aria-label="Password"
        />
        {error && <p className="text-rose-500 font-medium text-sm mt-2">{error}</p>}
        {successMessage && <p className="text-emerald-500 font-medium text-sm mt-2">{successMessage}</p>}
        <Button type="submit" className="w-full text-xl py-3 rounded-2xl">
          {isLogin ? 'Login' : 'Create Account'}
        </Button>
      </form>
      <div className="mt-6">
        <p className="text-gray-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => onSwitchView(isLogin ? ViewMode.REGISTER : ViewMode.LOGIN)}
            className="text-sky-500 hover:text-sky-600 font-bold underline focus:outline-none"
            aria-label={isLogin ? "Switch to register form" : "Switch to login form"}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
      <p className="text-xs text-gray-400 mt-8">
        Note: Data stored locally in browser.
      </p>
    </div>
  );
};

export default AuthForm;