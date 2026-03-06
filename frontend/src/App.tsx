import React, { useState, useEffect } from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import ExerciseLibrary from "./components/ExerciseLibrary";
import WorkoutCreator from "./components/WorkoutCreator";
import WorkoutEditor from "./components/WorkoutEditor";
import Workouts from "./components/Workouts";
import UserProfile from "./components/UserProfile";
import Sidebar from "./components/Sidebar";
import MobileNavigation from "./components/MobileNavigation";
import LoginPanel from "./components/LoginPanel";
import UserProfileSetup from "./components/UserProfileSetup";
import { useUserProfile } from "./hooks/useQueries";
import { useActor } from "./hooks/useActor";

type ActiveTab = "exercises" | "workouts" | "profile" | "edit-workout";

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("exercises");
  const [editingWorkoutId, setEditingWorkoutId] = useState<bigint | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { identity, clear, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetching: profileFetching,
    error: profileError,
  } = useUserProfile();

  const isAuthenticated = !!identity;

  // Apply theme to document root
  const applyTheme = (darkMode: boolean) => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Set dark mode as default on initial load
  useEffect(() => {
    applyTheme(true); // Start with dark mode
  }, []);

  // Update theme when user profile loads from backend
  useEffect(() => {
    if (userProfile && userProfile.darkMode !== undefined) {
      const backendDarkMode = userProfile.darkMode;
      setIsDarkMode(backendDarkMode);
      applyTheme(backendDarkMode);
    }
  }, [userProfile]);

  // Apply theme whenever isDarkMode changes
  useEffect(() => {
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  const handleEditWorkout = (workoutId: bigint) => {
    setEditingWorkoutId(workoutId);
    setActiveTab("edit-workout");
    setIsMobileMenuOpen(false);
  };

  const handleFinishEditing = () => {
    setEditingWorkoutId(null);
    setActiveTab("workouts");
  };

  const handleThemeToggle = (newDarkMode: boolean) => {
    setIsDarkMode(newDarkMode);
    applyTheme(newDarkMode);
  };

  const handleCreateWorkout = () => {
    setActiveTab("workouts");
    setIsMobileMenuOpen(false);
    // Navigate to create workout - this will be handled by the Workouts component
    setTimeout(() => {
      const createButton = document.querySelector(
        "[data-create-workout]",
      ) as HTMLButtonElement;
      if (createButton) {
        createButton.click();
      }
    }, 100);
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "exercises":
        return <ExerciseLibrary />;
      case "edit-workout":
        return editingWorkoutId ? (
          <WorkoutEditor
            workoutId={editingWorkoutId}
            onFinishEditing={handleFinishEditing}
          />
        ) : (
          <ExerciseLibrary />
        );
      case "workouts":
        return (
          <Workouts
            onEditWorkout={handleEditWorkout}
            onCreateWorkout={handleCreateWorkout}
          />
        );
      case "profile":
        return (
          <UserProfile
            onThemeToggle={handleThemeToggle}
            isDarkMode={isDarkMode}
          />
        );
      default:
        return <ExerciseLibrary />;
    }
  };

  const handleLogout = () => {
    clear();
    setIsMobileMenuOpen(false);
  };

  // Show login panel if not authenticated and not initializing
  if (!isAuthenticated && !isInitializing) {
    return <LoginPanel />;
  }

  // Determine loading states more precisely
  const isInitializingAuth = isInitializing;
  const isLoadingActor = isAuthenticated && actorFetching && !actor;
  const isLoadingProfile =
    isAuthenticated &&
    actor &&
    (profileLoading || profileFetching) &&
    userProfile === undefined;

  // Show loading if we're still initializing auth or loading the actor
  if (isInitializingAuth || isLoadingActor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isInitializingAuth
              ? "Initializing authentication..."
              : "Connecting to backend..."}
          </p>
        </div>
      </div>
    );
  }

  // Show loading while profile is being fetched (only if we don't have profile data yet)
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // If we're authenticated and have an actor, but profile loading failed or returned null/no name
  if (isAuthenticated && actor) {
    // If there was an error loading the profile, or profile is null, or profile has no name
    if (
      profileError ||
      userProfile === null ||
      (userProfile && !userProfile.name)
    ) {
      return <UserProfileSetup />;
    }

    // If we have a complete user profile with a name, show the main app
    if (userProfile && userProfile.name) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar
              activeTab={activeTab}
              onTabChange={handleTabChange}
              isEditingWorkout={activeTab === "edit-workout"}
              userProfile={userProfile}
              onLogout={handleLogout}
            />
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <MobileNavigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
              isEditingWorkout={activeTab === "edit-workout"}
              userProfile={userProfile}
              onLogout={handleLogout}
              isOpen={isMobileMenuOpen}
              onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:ml-64">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
              <main>{renderActiveComponent()}</main>
            </div>
          </div>
        </div>
      );
    }
  }

  // Fallback: if we reach here and are authenticated but something is wrong, show profile setup
  if (isAuthenticated) {
    return <UserProfileSetup />;
  }

  // Final fallback: show login panel
  return <LoginPanel />;
}

export default App;
