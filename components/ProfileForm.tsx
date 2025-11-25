// components/ProfileForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import Input from './Input';
import { User } from '../types';

interface ProfileFormProps {
  currentUser: User;
  onBackToGame: () => void;
  onUpdateProfile: (updateData: Partial<User & { newPassword?: string }>) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  currentUser,
  onBackToGame,
  onUpdateProfile,
}) => {
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize form with current user data
    setDisplayName(currentUser.displayName || currentUser.username);
    setEmail(currentUser.email || '');
    setProfilePicturePreview(currentUser.profilePictureBase64 || null);
  }, [currentUser]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { // Limit to 500KB for localStorage
        setError('Image too large. Please choose an image under 500KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const updateData: Partial<User & { newPassword?: string }> = {};
    let hasChanges = false;

    // Check for display name change
    if (displayName !== (currentUser.displayName || currentUser.username)) {
      updateData.displayName = displayName;
      hasChanges = true;
    }

    // Check for email change
    if (email !== (currentUser.email || '')) {
      updateData.email = email;
      hasChanges = true;
    }

    // Check for profile picture change (comparing with existing)
    if (profilePicturePreview !== (currentUser.profilePictureBase64 || null)) {
      updateData.profilePictureBase64 = profilePicturePreview || undefined;
      hasChanges = true;
    }

    // Handle password update logic
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setError('New password and confirmation do not match.');
        return;
      }
      if (newPassword.length < 3) {
        setError('New password must be at least 3 characters long.');
        return;
      }
      updateData.newPassword = newPassword;
      hasChanges = true;
    }

    if (!hasChanges) {
      setError('No changes to save.');
      return;
    }

    onUpdateProfile(updateData);
    setSuccessMessage('Profile updated successfully!');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl w-full max-w-md mx-auto border-4 border-white">
      <h2 className="text-3xl font-extrabold mb-6 text-indigo-900 text-center">
        Edit Profile
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-6">
          <div 
            className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden mb-3 border-4 border-white shadow-md cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => fileInputRef.current?.click()}
          >
            {profilePicturePreview ? (
              <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl text-indigo-300">👤</span>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoChange} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-sky-500 font-semibold hover:underline"
          >
            Change Photo
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2 text-left">Display Name</label>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display Name"
              className="py-3 text-lg"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2 text-left">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="py-3 text-lg"
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-gray-500 text-sm mb-3 font-medium">Change Password (Optional)</p>
            <div className="space-y-3">
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="py-3 text-lg"
              />
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="py-3 text-lg"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-rose-500 text-sm font-bold mt-2">{error}</p>}
        {successMessage && <p className="text-emerald-500 text-sm font-bold mt-2">{successMessage}</p>}
        
        <Button type="submit" className="w-full text-xl py-3 rounded-2xl">
          Save Changes
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <Button onClick={onBackToGame} className="text-xl px-8 py-3" variant="secondary">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ProfileForm;