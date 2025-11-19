// components/ProfileForm.tsx
import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';

interface ProfileFormProps {
  username: string;
  onBackToGame: () => void;
  onUpdatePassword: (username: string, newPasswordHash: string) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  username,
  onBackToGame,
  onUpdatePassword,
}) => {
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both new password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 3) { // Consistent with registration's simple check
      setError('New password must be at least 3 characters long.');
      return;
    }

    onUpdatePassword(username, newPassword); // Update password (hash for demo)
    setSuccessMessage('Password updated successfully!');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="bg-gradient-to-br from-indigo-700 to-purple-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm mx-auto text-white text-center border-4 border-indigo-500">
      <h2 className="text-4xl font-extrabold mb-6 drop-shadow-lg">
        Update Profile
      </h2>
      <p className="text-xl text-gray-200 mb-4">Logged in as: <span className="font-semibold text-yellow-300">{username}</span></p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          required
          aria-label="New Password"
        />
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm New Password"
          required
          aria-label="Confirm New Password"
        />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        {successMessage && <p className="text-emerald-400 text-sm mt-2">{successMessage}</p>}
        <Button type="submit" className="w-full text-xl py-3">
          Update Password
        </Button>
      </form>
      <div className="mt-6 text-center">
        <Button onClick={onBackToGame} className="text-xl px-8 py-4" variant="secondary">
          Back to Game
        </Button>
      </div>
    </div>
  );
};

export default ProfileForm;