import React, { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  User,
  Edit3,
  Save,
  X,
  Shield,
  Calendar,
  Moon,
  Sun,
} from "lucide-react";
import {
  useUserProfile,
  useSaveUserProfile,
  useToggleDarkMode,
} from "../hooks/useQueries";
import { useModal } from "../hooks/useModal";
import NotificationModal from "./NotificationModal";

interface UserProfileProps {
  onThemeToggle: (isDark: boolean) => void;
  isDarkMode: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({
  onThemeToggle,
  isDarkMode,
}) => {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading } = useUserProfile();
  const saveProfileMutation = useSaveUserProfile();
  const toggleDarkModeMutation = useToggleDarkMode();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const { modalState, hideModal, showSuccess, showError } = useModal();

  const handleStartEdit = () => {
    setEditName(userProfile?.name || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    try {
      await saveProfileMutation.mutateAsync({ name: editName.trim() });
      setIsEditing(false);
      setEditName("");
      showSuccess(
        "Profile Updated",
        "Your profile has been successfully updated.",
      );
    } catch (error) {
      console.error("Failed to update profile:", error);
      showError("Update Failed", "Failed to update profile. Please try again.");
    }
  };

  const handleToggleDarkMode = async () => {
    try {
      // First update the backend
      await toggleDarkModeMutation.mutateAsync();

      // Then update the UI optimistically based on the current state
      const newDarkMode = !isDarkMode;
      onThemeToggle(newDarkMode);

      showSuccess(
        "Theme Updated",
        `Switched to ${newDarkMode ? "dark" : "light"} mode. Your preference has been saved.`,
      );
    } catch (error) {
      console.error("Failed to toggle dark mode:", error);
      showError(
        "Theme Update Failed",
        "Failed to update theme preference. Please try again.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="text-red-500 mb-4">
            <User size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Unable to load your profile information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        User Profile
      </h2>

      {/* Profile Information Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 mb-6">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-100 dark:bg-blue-900 p-6">
            <User size={48} className="text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Name Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Name
          </label>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                required
                autoFocus
                maxLength={50}
                disabled={saveProfileMutation.isPending}
              />

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={!editName.trim() || saveProfileMutation.isPending}
                  className="bg-green-600 text-white px-4 py-2 hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {saveProfileMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  <span>Save</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saveProfileMutation.isPending}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4">
              <span className="text-lg font-medium text-gray-800 dark:text-white">
                {userProfile.name}
              </span>
              <button
                onClick={handleStartEdit}
                className="bg-blue-600 text-white px-3 py-2 hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Edit3 size={16} />
                <span>Edit</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Preference Section */}
        <div className="mb-6 border-t border-gray-200 dark:border-gray-600 pt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme Preference
          </label>

          <div className="bg-gray-50 dark:bg-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isDarkMode ? (
                  <Moon
                    size={20}
                    className="text-gray-600 dark:text-gray-300"
                  />
                ) : (
                  <Sun size={20} className="text-gray-600 dark:text-gray-300" />
                )}
                <div>
                  <span className="text-lg font-medium text-gray-800 dark:text-white">
                    {isDarkMode ? "Dark Mode" : "Light Mode"}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isDarkMode
                      ? "Dark backgrounds with light text"
                      : "Light backgrounds with dark text"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleDarkMode}
                disabled={toggleDarkModeMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {toggleDarkModeMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : isDarkMode ? (
                  <Sun size={16} />
                ) : (
                  <Moon size={16} />
                )}
                <span>Switch to {isDarkMode ? "Light" : "Dark"} Mode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
            <Shield size={20} className="text-blue-600 dark:text-blue-400" />
            <span>Account Information</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Internet Identity Principal
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 p-3">
                <code className="text-sm text-gray-800 dark:text-gray-200 font-mono break-all">
                  {identity?.getPrincipal().toString()}
                </code>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Type
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 p-3">
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  Authenticated User
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tips Card */}
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 p-6">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center space-x-2">
          <Calendar size={20} />
          <span>Profile Tips</span>
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
          <li>• Your display name appears throughout the application</li>
          <li>• You can update your name and theme preference at any time</li>
          <li>
            • Your theme preference is saved and synced across all devices
          </li>
          <li>• Your data is securely stored with Internet Identity</li>
          <li>• Only you can access and modify your profile information</li>
        </ul>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type as "success" | "error" | "warning" | "info"}
      />
    </div>
  );
};

export default UserProfile;
