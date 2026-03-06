import React from "react";
import {
  Dumbbell,
  Calendar,
  User,
  Edit3,
  LogOut,
  Heart,
  Menu,
  X,
} from "lucide-react";
import type { UserProfile } from "../backend";

type ActiveTab = "exercises" | "workouts" | "profile" | "edit-workout";

interface MobileNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isEditingWorkout?: boolean;
  userProfile: UserProfile;
  onLogout: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onTabChange,
  isEditingWorkout = false,
  userProfile,
  onLogout,
  isOpen,
  onToggle,
}) => {
  const tabs = [
    { id: "exercises" as const, label: "Exercise Library", icon: Dumbbell },
    { id: "workouts" as const, label: "Workouts", icon: Calendar },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2">
              <Dumbbell size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                Fitness Tracker
              </h2>
            </div>
          </div>

          <button
            onClick={onToggle}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay - positioned behind the sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Mobile Menu - positioned above the overlay */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2">
                <Dumbbell size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                  Fitness Tracker
                </h2>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 dark:bg-blue-900 p-1">
                <User size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {userProfile.name}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {/* Editing Workout Status */}
          {isEditingWorkout && (
            <div className="mb-4 p-3 bg-orange-100 dark:bg-orange-900 border border-orange-200 dark:border-orange-700">
              <div className="flex items-center space-x-2 text-orange-800 dark:text-orange-200">
                <Edit3 size={16} />
                <span className="text-sm font-medium">Editing Workout</span>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="space-y-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                disabled={isEditingWorkout && id !== "workouts"}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                  activeTab === id
                    ? "bg-blue-600 text-white"
                    : isEditingWorkout && id !== "workouts"
                      ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-200 hover:text-gray-800 dark:hover:text-gray-800"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-200 hover:text-gray-800 dark:hover:text-gray-800 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-xs">
          © 2025. Built with <Heart size={12} className="inline text-red-500" />{" "}
          using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
          >
            caffeine.ai
          </a>
        </div>
      </div>

      {/* Spacer for mobile header */}
      <div className="h-16 lg:hidden" />
    </>
  );
};

export default MobileNavigation;
