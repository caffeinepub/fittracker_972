import React, { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { User, Save, Dumbbell } from "lucide-react";
import {
  useSaveUserProfile,
  useSetupDefaultExercises,
} from "../hooks/useQueries";
import { useModal } from "../hooks/useModal";
import NotificationModal from "./NotificationModal";

const UserProfileSetup: React.FC = () => {
  const [name, setName] = useState("");
  const [setupStep, setSetupStep] = useState<
    "profile" | "exercises" | "complete"
  >("profile");
  const { identity, clear } = useInternetIdentity();
  const saveProfileMutation = useSaveUserProfile();
  const setupDefaultExercisesMutation = useSetupDefaultExercises();

  const { modalState, hideModal, showError } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSetupStep("profile");

      // First save the user profile
      await saveProfileMutation.mutateAsync({ name: name.trim() });

      setSetupStep("exercises");

      // Then add default exercises to their library
      await setupDefaultExercisesMutation.mutateAsync();

      setSetupStep("complete");

      // The profile setup is complete, the parent component will handle the transition
    } catch (error) {
      console.error("Failed to save profile or setup exercises:", error);
      showError("Setup Failed", "Failed to complete setup. Please try again.");
      setSetupStep("profile");
    }
  };

  const handleLogout = () => {
    clear();
  };

  const isLoading =
    saveProfileMutation.isPending || setupDefaultExercisesMutation.isPending;

  const getStepMessage = () => {
    switch (setupStep) {
      case "profile":
        return isLoading ? "Saving your profile..." : "Save Profile";
      case "exercises":
        return "Setting up your exercise library...";
      case "complete":
        return "Setup complete! Loading your dashboard...";
      default:
        return "Save Profile";
    }
  };

  const getProgressMessage = () => {
    switch (setupStep) {
      case "profile":
        return "Step 1 of 2: Creating your profile";
      case "exercises":
        return "Step 2 of 2: Adding default exercises to your library";
      case "complete":
        return "Welcome to your fitness tracker!";
      default:
        return "Let's get started";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4">
              <User size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to Fitness Tracker!
          </h1>
          <p className="text-gray-300">
            Let's personalize your experience by setting up your profile
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="text-center mb-3">
            <p className="text-sm font-medium text-gray-300">
              {getProgressMessage()}
            </p>
          </div>
          <div className="w-full bg-gray-700 h-2">
            <div
              className={`bg-blue-600 h-2 transition-all duration-500 ${
                setupStep === "profile"
                  ? "w-1/3"
                  : setupStep === "exercises"
                    ? "w-2/3"
                    : "w-full"
              }`}
            ></div>
          </div>
        </div>

        {/* Profile Setup Card */}
        <div className="bg-gray-800 border border-gray-700 p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              What should we call you?
            </h2>
            <p className="text-gray-300 text-sm">
              Enter your name to get started with your fitness journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                required
                autoFocus
                maxLength={50}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{getStepMessage()}</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Continue</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full text-gray-400 hover:text-gray-200 transition-colors text-sm disabled:opacity-50"
            >
              Sign out and use a different account
            </button>
          </div>
        </div>

        {/* Setup Info Card */}
        <div className="bg-gray-800 border border-gray-700 p-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Dumbbell size={16} className="text-blue-400" />
              <span className="text-sm font-medium text-gray-300">
                What we'll set up for you:
              </span>
            </div>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Your personal profile</li>
              <li>
                • Default exercise library (Push-ups, Squats, Plank, Jumping
                Jacks, Lunges)
              </li>
              <li>• Secure data storage with Internet Identity</li>
            </ul>
          </div>
        </div>

        {/* Setup Status */}
        {isLoading && (
          <div className="bg-blue-900 border border-blue-700 p-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                <span className="text-sm font-medium text-blue-200">
                  {setupStep === "profile"
                    ? "Creating your profile..."
                    : setupStep === "exercises"
                      ? "Adding default exercises..."
                      : "Finalizing setup..."}
                </span>
              </div>
              {setupStep === "exercises" && (
                <p className="text-xs text-blue-300">
                  Adding Push-ups, Squats, Plank, Jumping Jacks, and Lunges to
                  your exercise library
                </p>
              )}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-gray-800 border border-gray-700 p-4">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-2">
              Your information is securely stored and only visible to you
            </p>
            <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
              <span>Principal ID:</span>
              <span className="font-mono">
                {identity?.getPrincipal().toString().slice(0, 12)}...
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          © 2025. Built with ❤️ using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            caffeine.ai
          </a>
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
    </div>
  );
};

export default UserProfileSetup;
