import React, { useState } from "react";
import {
  Plus,
  X,
  Check,
  User,
  Clock,
  Hash,
  Layers,
  Target,
} from "lucide-react";
import { useExercises, useCreateWorkout } from "../hooks/useQueries";
import { useModal } from "../hooks/useModal";
import NotificationModal from "./NotificationModal";
import type { Exercise } from "../backend";

interface ExercisePerformance {
  exercise: Exercise;
  reps?: number;
  targetSets?: number;
  actualSets?: number;
  duration?: number; // in minutes
}

interface WorkoutCreatorProps {
  onWorkoutCreated?: () => void;
}

const WorkoutCreator: React.FC<WorkoutCreatorProps> = ({
  onWorkoutCreated,
}) => {
  const [selectedExercises, setSelectedExercises] = useState<
    ExercisePerformance[]
  >([]);
  const [showExerciseList, setShowExerciseList] = useState(false);

  const { data: exercises = [], isLoading: exercisesLoading } = useExercises();
  const createWorkoutMutation = useCreateWorkout();

  const { modalState, hideModal, showSuccess, showError } = useModal();

  const handleAddExercise = (exercise: Exercise) => {
    if (!selectedExercises.find((e) => e.exercise.id === exercise.id)) {
      const newExercisePerformance: ExercisePerformance = {
        exercise,
        reps: exercise.exerciseType === "Strength" ? undefined : undefined,
        targetSets:
          exercise.exerciseType === "Strength" ? undefined : undefined,
        actualSets:
          exercise.exerciseType === "Strength" ? undefined : undefined,
        duration: exercise.exerciseType === "Cardio" ? undefined : undefined,
      };
      setSelectedExercises([...selectedExercises, newExercisePerformance]);
    }
    setShowExerciseList(false);
  };

  const handleRemoveExercise = (exerciseId: bigint) => {
    setSelectedExercises(
      selectedExercises.filter((e) => e.exercise.id !== exerciseId),
    );
  };

  const handleUpdatePerformance = (
    exerciseId: bigint,
    field: "reps" | "targetSets" | "actualSets" | "duration",
    value: number,
  ) => {
    setSelectedExercises((prev) =>
      prev.map((item) =>
        item.exercise.id === exerciseId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleCreateWorkout = async () => {
    if (selectedExercises.length === 0) return;

    // Validate that all exercises have performance data
    const hasIncompleteData = selectedExercises.some((item) => {
      if (item.exercise.exerciseType === "Strength") {
        return (
          !item.reps ||
          item.reps <= 0 ||
          !item.targetSets ||
          item.targetSets <= 0
        );
      } else if (item.exercise.exerciseType === "Cardio") {
        return !item.duration || item.duration <= 0;
      }
      return false;
    });

    if (hasIncompleteData) {
      showError(
        "Incomplete Data",
        "Please enter performance data for all exercises (reps and target sets for strength exercises, duration in minutes for cardio exercises).",
      );
      return;
    }

    try {
      const exerciseIds = selectedExercises.map((e) => e.exercise.id);

      // Prepare performance data for backend
      const performanceData = selectedExercises.reduce(
        (acc, item) => {
          acc[item.exercise.id.toString()] = {
            reps: item.reps,
            targetSets: item.targetSets,
            actualSets: item.actualSets || 0, // Default to 0 if not set
            duration: item.duration,
            exerciseType: item.exercise.exerciseType,
          };
          return acc;
        },
        {} as Record<string, any>,
      );

      await createWorkoutMutation.mutateAsync({ exerciseIds, performanceData });

      setSelectedExercises([]);
      showSuccess(
        "Workout Created",
        "Your workout has been successfully created with performance data!",
      );

      // Call the callback if provided
      if (onWorkoutCreated) {
        setTimeout(() => {
          onWorkoutCreated();
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to create workout:", error);
      showError(
        "Creation Failed",
        "Failed to create workout. Please try again.",
      );
    }
  };

  const getAvailableExercises = () => {
    return exercises.filter(
      (exercise) =>
        !selectedExercises.find(
          (selected) => selected.exercise.id === exercise.id,
        ),
    );
  };

  if (exercisesLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Selected Exercises
          </h3>
          <button
            onClick={() => setShowExerciseList(true)}
            className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <Plus size={18} />
            <span>Add Exercise</span>
          </button>
        </div>

        {selectedExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No exercises selected. Add exercises to create your workout.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {selectedExercises.map((item, index) => (
              <div
                key={item.exercise.id.toString()}
                className="bg-gray-50 dark:bg-gray-700 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="bg-blue-600 text-white w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-800 dark:text-white break-words">
                        {item.exercise.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {item.exercise.exerciseType}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveExercise(item.exercise.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1 flex-shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Performance Data Input */}
                <div className="ml-0 sm:ml-9">
                  {item.exercise.exerciseType === "Strength" ? (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                            <Hash size={16} />
                            <span className="text-sm font-medium">Reps:</span>
                          </div>
                          <input
                            type="number"
                            min="1"
                            value={item.reps || ""}
                            onChange={(e) =>
                              handleUpdatePerformance(
                                item.exercise.id,
                                "reps",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="0"
                            required
                          />
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                            <Target size={16} />
                            <span className="text-sm font-medium">
                              Target Sets:
                            </span>
                          </div>
                          <input
                            type="number"
                            min="1"
                            value={item.targetSets || ""}
                            onChange={(e) =>
                              handleUpdatePerformance(
                                item.exercise.id,
                                "targetSets",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="0"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                            <Layers size={16} />
                            <span className="text-sm font-medium">
                              Actual Sets Completed:
                            </span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={item.actualSets || ""}
                            onChange={(e) =>
                              handleUpdatePerformance(
                                item.exercise.id,
                                "actualSets",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="0"
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          (Optional - can be updated during workout)
                        </span>
                      </div>
                    </div>
                  ) : item.exercise.exerciseType === "Cardio" ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                          <Clock size={16} />
                          <span className="text-sm font-medium">
                            Duration (minutes):
                          </span>
                        </div>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={item.duration || ""}
                          onChange={(e) =>
                            handleUpdatePerformance(
                              item.exercise.id,
                              "duration",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="0"
                          required
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedExercises.length > 0 && (
          <button
            onClick={handleCreateWorkout}
            disabled={createWorkoutMutation.isPending}
            className="w-full bg-green-600 text-white py-3 hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {createWorkoutMutation.isPending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Check size={20} />
            )}
            <span>Create Workout</span>
          </button>
        )}
      </div>

      {showExerciseList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-hidden mx-4">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Add Exercise
              </h3>
              <button
                onClick={() => setShowExerciseList(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4">
              {getAvailableExercises().length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  {exercises.length === 0
                    ? "No exercises available. Add some exercises first!"
                    : "All exercises have been added to this workout."}
                </p>
              ) : (
                <div className="space-y-2">
                  {getAvailableExercises().map((exercise) => (
                    <button
                      key={exercise.id.toString()}
                      onClick={() => handleAddExercise(exercise)}
                      className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-800 dark:text-white break-words">
                              {exercise.name}
                            </h4>
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
                          </div>
                          {exercise.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-words">
                              {exercise.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {exercise.exerciseType === "Strength"
                              ? "Track: Reps, Target Sets & Actual Sets"
                              : exercise.exerciseType === "Cardio"
                                ? "Track: Duration (minutes)"
                                : "Track: Custom"}
                          </p>
                        </div>
                        <Plus
                          size={16}
                          className="text-blue-600 mt-1 ml-2 flex-shrink-0"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
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
    </div>
  );
};

export default WorkoutCreator;
