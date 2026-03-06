import React, { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  Calendar,
  CheckCircle,
  Clock,
  Dumbbell,
  Trash2,
  Hash,
  Timer,
  Edit3,
  Check,
  X,
  Copy,
  Layers,
  Target,
  Plus,
} from "lucide-react";
import {
  useWorkoutHistory,
  useExercises,
  useDeleteWorkout,
  useWorkoutPerformance,
  useMarkExerciseComplete,
  useMarkExerciseIncomplete,
  useIsExerciseCompleted,
  useCopyWorkout,
  useActualSets,
  useUpdateActualSets,
} from "../hooks/useQueries";
import { useModal, useConfirmationModal } from "../hooks/useModal";
import NotificationModal from "./NotificationModal";
import ConfirmationModal from "./ConfirmationModal";
import WorkoutCreator from "./WorkoutCreator";
import type { ExercisePerformance } from "../backend";

interface WorkoutsProps {
  onEditWorkout: (workoutId: bigint) => void;
  onCreateWorkout?: () => void;
}

const Workouts: React.FC<WorkoutsProps> = ({
  onEditWorkout,
  onCreateWorkout,
}) => {
  const { identity } = useInternetIdentity();
  const [showCreateWorkout, setShowCreateWorkout] = useState(false);
  const { data: workouts = [], isLoading: workoutsLoading } =
    useWorkoutHistory();
  const { data: exercises = [], isLoading: exercisesLoading } = useExercises();
  const deleteWorkoutMutation = useDeleteWorkout();
  const copyWorkoutMutation = useCopyWorkout();

  const { modalState, hideModal, showSuccess, showError } = useModal();
  const {
    isOpen: confirmationOpen,
    confirmationData,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
  } = useConfirmationModal();

  const getExerciseById = (id: bigint) => {
    return exercises.find((exercise) => exercise.id === id);
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteWorkout = async (
    workoutId: bigint,
    workoutNumber: string,
  ) => {
    showConfirmation(
      "Delete Workout",
      `Are you sure you want to delete Workout #${workoutNumber}? This action cannot be undone.`,
      async () => {
        try {
          await deleteWorkoutMutation.mutateAsync(workoutId);
          showSuccess(
            "Workout Deleted",
            "The workout has been successfully deleted.",
          );
        } catch (error) {
          console.error("Failed to delete workout:", error);
          showError("Error", "Failed to delete workout. Please try again.");
        }
      },
      { type: "danger", confirmText: "Delete", cancelText: "Cancel" },
    );
  };

  const handleCopyWorkout = async (
    workoutId: bigint,
    workoutNumber: string,
  ) => {
    try {
      const newWorkoutId = await copyWorkoutMutation.mutateAsync(workoutId);
      showSuccess(
        "Workout Copied",
        `A new workout (#${newWorkoutId.toString()}) has been created with all exercises from Workout #${workoutNumber}. All exercises in the new workout are marked as incomplete with performance data copied (reps and target sets for strength exercises, duration for cardio exercises) and actual sets completed reset to zero.`,
      );
    } catch (error: any) {
      console.error("Failed to copy workout:", error);
      showError("Error", "Failed to copy workout. Please try again.");
    }
  };

  const handleCreateWorkout = () => {
    setShowCreateWorkout(true);
  };

  const handleWorkoutCreated = () => {
    setShowCreateWorkout(false);
    // Optionally show success message or refresh data
  };

  const canDeleteWorkout = (workout: any) => {
    if (!identity) return false;
    return workout.owner.toString() === identity.getPrincipal().toString();
  };

  const canEditWorkout = (workout: any) => {
    if (!identity) return false;
    return (
      workout.owner.toString() === identity.getPrincipal().toString() &&
      !workout.completed
    );
  };

  const canToggleExerciseComplete = (workout: any) => {
    if (!identity) return false;
    return (
      workout.owner.toString() === identity.getPrincipal().toString() &&
      !workout.completed
    );
  };

  const canCopyWorkout = (workout: any) => {
    if (!identity) return false;
    return workout.owner.toString() === identity.getPrincipal().toString();
  };

  if (workoutsLoading || exercisesLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show workout creator if requested
  if (showCreateWorkout) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Create New Workout
          </h2>
          <button
            onClick={() => setShowCreateWorkout(false)}
            className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors w-full sm:w-auto"
          >
            Back to Workouts
          </button>
        </div>
        <WorkoutCreator onWorkoutCreated={handleWorkoutCreated} />
      </div>
    );
  }

  // Sort workouts by timestamp (newest first)
  const sortedWorkouts = [...workouts].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Workouts
        </h2>
        <button
          onClick={handleCreateWorkout}
          data-create-workout
          className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Create Workout</span>
        </button>
      </div>

      {sortedWorkouts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar size={48} className="mx-auto" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No workouts yet. Create your first workout to get started!
          </p>
          <button
            onClick={handleCreateWorkout}
            className="bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus size={20} />
            <span>Create Your First Workout</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedWorkouts.map((workout) => (
            <WorkoutCard
              key={workout.id.toString()}
              workout={workout}
              exercises={exercises}
              onDelete={() =>
                handleDeleteWorkout(workout.id, workout.id.toString())
              }
              onEdit={() => onEditWorkout(workout.id)}
              onCopy={() =>
                handleCopyWorkout(workout.id, workout.id.toString())
              }
              canDelete={canDeleteWorkout(workout)}
              canEdit={canEditWorkout(workout)}
              canCopy={canCopyWorkout(workout)}
              canToggleExerciseComplete={canToggleExerciseComplete(workout)}
              isDeleting={deleteWorkoutMutation.isPending}
              isCopying={copyWorkoutMutation.isPending}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type as "success" | "error" | "warning" | "info"}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={confirmationData.title}
        message={confirmationData.message}
        type={confirmationData.type}
        confirmText={confirmationData.confirmText}
        cancelText={confirmationData.cancelText}
        isLoading={deleteWorkoutMutation.isPending}
      />
    </div>
  );
};

// Separate component for individual workout cards to handle performance data loading
const WorkoutCard: React.FC<{
  workout: any;
  exercises: any[];
  onDelete: () => void;
  onEdit: () => void;
  onCopy: () => void;
  canDelete: boolean;
  canEdit: boolean;
  canCopy: boolean;
  canToggleExerciseComplete: boolean;
  isDeleting: boolean;
  isCopying: boolean;
  formatDate: (timestamp: bigint) => string;
}> = ({
  workout,
  exercises,
  onDelete,
  onEdit,
  onCopy,
  canDelete,
  canEdit,
  canCopy,
  canToggleExerciseComplete,
  isDeleting,
  isCopying,
  formatDate,
}) => {
  const { data: workoutPerformance } = useWorkoutPerformance(workout.id);
  const markExerciseCompleteMutation = useMarkExerciseComplete();
  const markExerciseIncompleteMutation = useMarkExerciseIncomplete();
  const [togglingExerciseId, setTogglingExerciseId] = useState<bigint | null>(
    null,
  );

  const getExerciseById = (id: bigint) => {
    return exercises.find((exercise) => exercise.id === id);
  };

  const handleToggleExerciseComplete = async (
    exerciseId: bigint,
    isCurrentlyCompleted: boolean,
  ) => {
    setTogglingExerciseId(exerciseId);
    try {
      if (isCurrentlyCompleted) {
        await markExerciseIncompleteMutation.mutateAsync({
          workoutId: workout.id,
          exerciseId,
        });
      } else {
        await markExerciseCompleteMutation.mutateAsync({
          workoutId: workout.id,
          exerciseId,
        });
      }
    } catch (error) {
      console.error("Failed to toggle exercise completion:", error);
    } finally {
      setTogglingExerciseId(null);
    }
  };

  // Get performance data from backend
  const getPerformanceData = (
    exerciseId: bigint,
  ): {
    reps?: number;
    targetSets?: number;
    duration?: number;
    exerciseType?: string;
  } | null => {
    if (!workoutPerformance?.exercisePerformances) return null;

    const performanceMap = workoutPerformance.exercisePerformances;

    const performanceAndId = performanceMap.find((e) => e[0] === exerciseId);
    if (!performanceAndId) return null;
    else if (!performanceAndId[1]) return null;
    const performance = performanceAndId[1];

    if ("strength" in performance) {
      return {
        reps: Number(performance.strength.reps),
        targetSets: Number(performance.strength.sets),
        exerciseType: "Strength",
      };
    } else if ("cardio" in performance) {
      return {
        duration: Number(performance.cardio.duration),
        exerciseType: "Cardio",
      };
    }

    return null;
  };

  const isAnyExerciseToggling = togglingExerciseId !== null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:bg-gray-25 dark:hover:bg-gray-775 transition-colors">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 flex-shrink-0 ${workout.completed ? "bg-green-100 dark:bg-green-900" : "bg-blue-100 dark:bg-blue-900"}`}
          >
            {workout.completed ? (
              <CheckCircle
                size={20}
                className="text-green-600 dark:text-green-400"
              />
            ) : (
              <Clock size={20} className="text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Workout #{workout.id.toString()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-1">
              <Calendar size={14} />
              <span>{formatDate(workout.timestamp)}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-3 py-1 text-xs font-medium ${
              workout.completed
                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
            }`}
          >
            {workout.completed ? "Completed" : "In Progress"}
          </span>

          {canCopy && (
            <button
              onClick={onCopy}
              disabled={isCopying}
              className="bg-purple-600 text-white px-3 py-1 hover:bg-purple-700 transition-colors text-xs flex items-center space-x-1 disabled:opacity-50"
              title="Copy workout with all exercises as incomplete and performance data copied"
            >
              {isCopying ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              ) : (
                <Copy size={12} />
              )}
              <span>Copy</span>
            </button>
          )}

          {canEdit && (
            <button
              onClick={onEdit}
              className="bg-orange-600 text-white px-3 py-1 hover:bg-orange-700 transition-colors text-xs flex items-center space-x-1"
              title="Edit workout"
            >
              <Edit3 size={12} />
              <span>Edit</span>
            </button>
          )}

          {canDelete && (
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white px-3 py-1 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-1 text-xs"
              title="Delete workout"
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              ) : (
                <Trash2 size={12} />
              )}
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Dumbbell size={16} className="text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Exercises ({workout.exerciseIds.length})
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {workout.exerciseIds.map((exerciseId: bigint, index: number) => (
            <ExerciseRow
              key={exerciseId.toString()}
              exerciseId={exerciseId}
              workoutId={workout.id}
              index={index}
              exercise={getExerciseById(exerciseId)}
              performanceData={getPerformanceData(exerciseId)}
              isWorkoutCompleted={workout.completed}
              canToggleComplete={canToggleExerciseComplete}
              onToggleComplete={handleToggleExerciseComplete}
              isToggling={togglingExerciseId === exerciseId}
              isAnyExerciseToggling={isAnyExerciseToggling}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Separate component for individual exercise rows
const ExerciseRow: React.FC<{
  exerciseId: bigint;
  workoutId: bigint;
  index: number;
  exercise: any;
  performanceData: {
    reps?: number;
    targetSets?: number;
    duration?: number;
    exerciseType?: string;
  } | null;
  isWorkoutCompleted: boolean;
  canToggleComplete: boolean;
  onToggleComplete: (exerciseId: bigint, isCurrentlyCompleted: boolean) => void;
  isToggling: boolean;
  isAnyExerciseToggling: boolean;
}> = ({
  exerciseId,
  workoutId,
  index,
  exercise,
  performanceData,
  isWorkoutCompleted,
  canToggleComplete,
  onToggleComplete,
  isToggling,
  isAnyExerciseToggling,
}) => {
  const { data: isCompleted = false } = useIsExerciseCompleted(
    workoutId,
    exerciseId,
  );
  const { data: actualSets = 0 } = useActualSets(workoutId, exerciseId);
  const updateActualSetsMutation = useUpdateActualSets();
  const [editingActualSets, setEditingActualSets] =
    useState<number>(actualSets);

  // Update local state when backend data changes
  React.useEffect(() => {
    setEditingActualSets(actualSets);
  }, [actualSets]);

  const handleActualSetsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setEditingActualSets(value);
  };

  const handleActualSetsBlur = async () => {
    if (editingActualSets !== actualSets && editingActualSets >= 0) {
      try {
        await updateActualSetsMutation.mutateAsync({
          workoutId,
          exerciseId,
          actualSets: editingActualSets,
        });
      } catch (error) {
        console.error("Failed to update actual sets:", error);
        // Reset to previous value on error
        setEditingActualSets(actualSets);
      }
    }
  };

  const handleActualSetsKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleActualSetsBlur();
    }
  };

  return (
    <div
      className={`p-3 transition-colors ${
        isCompleted
          ? "bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700"
          : "bg-gray-50 dark:bg-gray-700"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <span
            className={`w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 ${
              isCompleted ? "bg-green-600 text-white" : "bg-blue-600 text-white"
            }`}
          >
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <span
                className={`text-sm font-medium break-words ${
                  isCompleted
                    ? "text-green-800 dark:text-green-200 line-through"
                    : "text-gray-800 dark:text-white"
                }`}
              >
                {exercise
                  ? exercise.name
                  : `Exercise #${exerciseId.toString()}`}
              </span>
              {exercise && (
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium flex-shrink-0 ${
                    exercise.exerciseType === "Strength"
                      ? "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                      : exercise.exerciseType === "Cardio"
                        ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                        : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  }`}
                >
                  {exercise.exerciseType}
                </span>
              )}
              {isCompleted && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 flex-shrink-0">
                  ✓ Completed
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* Performance Data Display */}
          {performanceData && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-300">
              {performanceData.exerciseType === "Strength" &&
                performanceData.reps &&
                performanceData.targetSets && (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center space-x-1">
                      <Hash size={14} />
                      <span className="font-medium">
                        {performanceData.reps} reps
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target size={14} />
                      <span className="font-medium">
                        {performanceData.targetSets} target
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Layers size={14} />
                      {!isWorkoutCompleted && canToggleComplete ? (
                        <input
                          type="number"
                          min="0"
                          value={editingActualSets}
                          onChange={handleActualSetsChange}
                          onBlur={handleActualSetsBlur}
                          onKeyPress={handleActualSetsKeyPress}
                          className="w-16 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={updateActualSetsMutation.isPending}
                        />
                      ) : (
                        <span className="font-medium">{actualSets}</span>
                      )}
                      <span className="font-medium">actual</span>
                    </div>
                  </div>
                )}
              {performanceData.exerciseType === "Cardio" &&
                performanceData.duration && (
                  <div className="flex items-center space-x-1">
                    <Timer size={14} />
                    <span className="font-medium">
                      {performanceData.duration} min
                    </span>
                  </div>
                )}
            </div>
          )}

          {/* Exercise Completion Toggle */}
          {!isWorkoutCompleted && canToggleComplete && (
            <button
              onClick={() => onToggleComplete(exerciseId, isCompleted)}
              disabled={isAnyExerciseToggling}
              className={`px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 flex items-center space-x-1 flex-shrink-0 ${
                isCompleted
                  ? "bg-orange-600 text-white hover:bg-orange-700 disabled:hover:bg-orange-600"
                  : "bg-green-600 text-white hover:bg-green-700 disabled:hover:bg-green-600"
              }`}
              title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
            >
              {isToggling ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              ) : isCompleted ? (
                <>
                  <X size={12} />
                  <span>Undo</span>
                </>
              ) : (
                <>
                  <Check size={12} />
                  <span>Complete</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workouts;
