'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye } from 'lucide-react';
import { useSecurityStore, useModalStore } from '@/lib/stores/dashboard';

export const SecurityModal: React.FC = () => {
  const {
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    currentPassword,
    newPassword,
    confirmPassword,
    toggleShowCurrentPassword,
    toggleShowNewPassword,
    toggleShowConfirmPassword,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword
  } = useSecurityStore();

  const { isSecurityModalOpen, closeSecurityModal } = useModalStore(); // Zustand Modal state

  // Handle scroll lock when modal is open/closed
  useEffect(() => {
    const body = document.body;
    if (isSecurityModalOpen) {
      body.style.overflow = 'hidden'; // Lock scrolling when modal is open
    } else {
      body.style.overflow = ''; // Restore scrolling when modal is closed
    }

    return () => {
      body.style.overflow = ''; // Cleanup on unmount
    };
  }, [isSecurityModalOpen]);

  if (!isSecurityModalOpen) return null; // Don't render the modal if it's not open

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold dark:text-gray-200">
          Security Settings
        </h2>

        {/* Password Change Section */}
        <div className="mt-4">
          <h3 className="text-lg font-medium dark:text-gray-200">Password</h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Please enter your current password to change your password.
          </p>
          <div className="mt-4 space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium dark:text-gray-200">
                Current Password*
              </label>
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-8"
                onClick={toggleShowCurrentPassword}
              >
                <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium dark:text-gray-200">
                New Password*
              </label>
              <Input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-8"
                onClick={toggleShowNewPassword}
              >
                <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium dark:text-gray-200">
                Confirm New Password*
              </label>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-8"
                onClick={toggleShowConfirmPassword}
              >
                <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-4">
            <Button variant="outline" onClick={closeSecurityModal}>
              Cancel
            </Button>
            <Button className="bg-blue-600 text-white">Update Password</Button>
          </div>
        </div>

        <hr className="my-6 dark:border-gray-600" />

        {/* Two-Factor Authentication Section */}
        <div>
          <h3 className="text-lg font-medium dark:text-gray-200">
            Two-Factor Authentication
          </h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Secure your account by enabling 2FA using SMS or an Authenticator
            app.
          </p>
          <div className="mt-4 space-y-4">
            <Button variant="secondary" className="w-full">
              Enable via SMS
            </Button>
            <Button variant="secondary" className="w-full">
              Enable via Authenticator App
            </Button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={closeSecurityModal}
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
