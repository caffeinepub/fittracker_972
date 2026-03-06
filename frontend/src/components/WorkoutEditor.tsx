import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  Save,
  ArrowLeft,
  Clock,
  Hash,
  Layers,
  Calendar,
  Target,
  Edit2,
} from "lucide-react";
import {
  useExercises,
  useWorkoutHistory,
  useAddExerciseToWorkout,
  useWorkoutPerformance,
  useUpdateActualSets,
  useActualSets,
} from "../hooks/useQueries";
import { useModal } from "../hooks/useModal";
import NotificationModal from "./NotificationModal";
import type { Exercise, Workout, ExercisePerformance } from "../backend";

interface ExercisePerformanceData {
  exercise: Exercise;
  reps?: number;
  targetSets?: number;
  actualSets?: number;
  duration?: number; // in minutes
}

interface WorkoutEditorProps {
  workoutId: bigint;
  onFinishEditing: () => void;
}

const WorkoutEditor: React.FC<WorkoutEditorProps> = ({
  workoutId,
  onFinishEditing,
}) => {
  const [newExercises, setNewExercises] = useState<ExercisePerformanceData[]>(
    [],
  );
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [currentWorkoutId, setCurrentWorkoutId] = useState<bigint>(workoutId);

  const { data: exercises = [], isLoading: exercisesLoading } = useExercises();
  const { data: workouts = [], isLoading: workoutsLoading } =
    useWorkoutHistory();
  const { data: workoutPerformance, isLoading: performanceLoading } =
    useWorkoutPerformance(currentWorkoutId);
  const addExerciseToWorkoutMutation = useAddExerciseToWorkout();
  const updateActualSetsMutation = useUpdateActualSets();

  const { modalState, hideModal, showSuccess, showError } = useModal();

  const currentWorkout = workouts.find((w) => w.id === currentWorkoutId);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getExerciseById = (id: bigint) => {
    return exercises.find((exercise) => exercise.id === id);
  };

  const handleAddExercise = (exercise: Exercise) => {
    if (!newExercises.find((e) => e.exercise.id === exercise.id)) {
      const newExercisePerformance: ExercisePerformanceData = {
        exercise,
        reps: exercise.exerciseType === "Strength" ? undefined : undefined,
        targetSets:
          exercise.exerciseType === "Strength" ? undefined : undefined,
        actualSets:
          exercise.exerciseType === "Strength" ? undefined : undefined,
        duration: exercise.exerciseType === "Cardio" ? undefined : undefined,
      };
      setNewExercises([...newExercises, newExercisePerformance]);
    }
    setShowExerciseList(false);
  };

  const handleRemoveNewExercise = (exerciseId: bigint) => {
    setNewExercises(newExercises.filter((e) => e.exercise.id !== exerciseId));
  };

  const handleUpdatePerformance = (
    exerciseId: bigint,
    field: "reps" | "targetSets" | "actualSets" | "duration",
    value: number,
  ) => {
    setNewExercises((prev) =>
      prev.map((item) =>
        item.exercise.id === exerciseId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleUpdateActualSets = async (
    exerciseId: bigint,
    actualSets: number,
  ) => {
    try {
      await updateActualSetsMutation.mutateAsync({
        workoutId: currentWorkoutId,
        exerciseId,
        actualSets,
      });
      showSuccess(
        "Sets Updated",
        "Actual sets completed has been updated successfully.",
      );
    } catch (error) {
      console.error("Failed to update actual sets:", error);
      showError(
        "Update Failed",
        "Failed to update actual sets. Please try again.",
      );
    }
  };

  const handleSaveChanges = async () => {
    if (newExercises.length === 0) {
      showError(
        "No Changes",
        "Please add at least one exercise to save changes.",
      );
      return;
    }

    // Validate that all new exercises have performance data
    const hasIncompleteData = newExercises.some((item) => {
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
        "Please enter performance data for all new exercises (reps and target sets for strength exercises, duration in minutes for cardio exercises).",
      );
      return;
    }

    try {
      const exerciseIds = newExercises.map((e) => e.exercise.id);

      // Prepare performance data for backend
      const performanceData = newExercises.reduce(
        (acc, item) => {
          acc[item.exercise.id.toString()] = {
            reps: item.reps,
            targetSets: item.targetSets,
            actualSets: item.actualSets || 0,
            duration: item.duration,
            exerciseType: item.exercise.exerciseType,
          };
          return acc;
        },
        {} as Record<string, any>,
      );

      const result = await addExerciseToWorkoutMutation.mutateAsync({
        workoutId: currentWorkoutId,
        exerciseIds,
        performanceData,
      });

      // Update the current workout ID to the new workout ID
      setCurrentWorkoutId(result.workoutId);
      setNewExercises([]);

      showSuccess(
        "Workout Updated",
        `Your workout has been successfully updated with ${exerciseIds.length} new exercise${exerciseIds.length > 1 ? "s" : ""}! All existing exercises and their completion status have been preserved.`,
      );

      // Auto-close after success
      setTimeout(() => {
        onFinishEditing();
      }, 2000);
    } catch (error) {
      console.error("Failed to update workout:", error);
      showError("Update Failed", "Failed to update workout. Please try again.");
    }
  };

  const getAvailableExercises = () => {
    if (!currentWorkout) return exercises;

    const currentExerciseIds = currentWorkout.exerciseIds.map((id) =>
      id.toString(),
    );
    const newExerciseIds = newExercises.map((e) => e.exercise.id.toString());

    return exercises.filter(
      (exercise) =>
        !currentExerciseIds.includes(exercise.id.toString()) &&
        !newExerciseIds.includes(exercise.id.toString()),
    );
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

  if (exercisesLoading || workoutsLoading || performanceLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentWorkout) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Workout Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The workout you're trying to edit could not be found.
          </p>
          <button
            onClick={onFinishEditing}
            className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            Back to Workouts
          </button>
        </div>
      </div>
    );
  }

  if (currentWorkout.completed) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Cannot Edit Completed Workout
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            This workout has been marked as completed and cannot be edited.
          </p>
          <button
            onClick={onFinishEditing}
            className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            Back to Workouts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onFinishEditing}
            className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-2 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors flex items-center space-x-2"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Edit Workout #{currentWorkout.id.toString()}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-1">
              <Calendar size={14} />
              <span>Created: {formatDate(currentWorkout.timestamp)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Current Exercises */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Current Exercises
        </h3>
        {currentWorkout.exerciseIds.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No exercises in this workout yet.
          </p>
        ) : (
          <div className="space-y-3">
            {currentWorkout.exerciseIds.map((exerciseId, index) => (
              <ExerciseRow
                key={exerciseId.toString()}
                exerciseId={exerciseId}
                workoutId={currentWorkoutId}
                index={index}
                exercise={getExerciseById(exerciseId)}
                performanceData={getPerformanceData(exerciseId)}
                onUpdateActualSets={handleUpdateActualSets}
                isUpdating={updateActualSetsMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add New Exercises */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Add New Exercises
          </h3>
          <button
            onClick={() => setShowExerciseList(true)}
            className="bg-green-600 text-white px-4 py-2 hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Exercise</span>
          </button>
        </div>

        {newExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>
              No new exercises added yet. Click "Add Exercise" to add more
              exercises to this workout.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {newExercises.map((item, index) => (
              <div
                key={item.exercise.id.toString()}
                className="bg-green-50 dark:bg-green-900 p-4 border border-green-200 dark:border-green-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="bg-green-600 text-white w-6 h-6 flex items-center justify-center text-sm font-medium">
                      +{index + 1}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">
                        {item.exercise.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {item.exercise.exerciseType}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveNewExercise(item.exercise.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Performance Data Input */}
                <div className="ml-9">
                  {item.exercise.exerciseType === "Strength" ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-6">
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
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
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
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            placeholder="0"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                          <Layers size={16} />
                          <span className="text-sm font-medium">
                            Actual Sets:
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
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          placeholder="0"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          (Optional)
                        </span>
                      </div>
                    </div>
                  ) : item.exercise.exerciseType === "Cardio" ? (
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
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="0"
                        required
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {newExercises.length > 0 && (
          <div className="flex space-x-3">
            <button
              onClick={handleSaveChanges}
              disabled={addExerciseToWorkoutMutation.isPending}
              className="bg-green-600 text-white px-6 py-3 hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {addExerciseToWorkoutMutation.isPending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save size={20} />
              )}
              <span>Save Changes</span>
            </button>
            <button
              onClick={() => setNewExercises([])}
              disabled={addExerciseToWorkoutMutation.isPending}
              className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-3 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
            >
              Clear New Exercises
            </button>
          </div>
        )}
      </div>

      {/* Exercise Selection Modal */}
      {showExerciseList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-96 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Add Exercise to Workout
              </h3>
              <button
                onClick={() => setShowExerciseList(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-80 p-4">
              {getAvailableExercises().length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  {exercises.length === 0
                    ? "No exercises available. Add some exercises first!"
                    : "All available exercises have been added to this workout."}
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
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              {exercise.name}
                            </h4>
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium ${
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
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                          className="text-green-600 mt-1 ml-2 flex-shrink-0"
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

// Separate component for individual exercise rows with actual sets functionality
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
  onUpdateActualSets: (exerciseId: bigint, actualSets: number) => void;
  isUpdating: boolean;
}> = ({
  exerciseId,
  workoutId,
  index,
  exercise,
  performanceData,
  onUpdateActualSets,
  isUpdating,
}) => {
  const { data: actualSets = 0 } = useActualSets(workoutId, exerciseId);
  const [editingActualSets, setEditingActualSets] =
    useState<number>(actualSets);

  useEffect(() => {
    setEditingActualSets(actualSets);
  }, [actualSets]);

  const handleActualSetsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setEditingActualSets(value);
  };

  const handleActualSetsBlur = () => {
    if (editingActualSets !== actualSets && editingActualSets >= 0) {
      onUpdateActualSets(exerciseId, editingActualSets);
    }
  };

  const handleActualSetsKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleActualSetsBlur();
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="bg-blue-600 text-white w-6 h-6 flex items-center justify-center text-sm font-medium">
            {index + 1}
          </span>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-white">
              {exercise ? exercise.name : `Exercise #${exerciseId.toString()}`}
            </h4>
            {exercise && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {exercise.exerciseType}
              </p>
            )}
          </div>
        </div>

        {/* Performance Data Display */}
        {performanceData && (
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            {performanceData.exerciseType === "Strength" &&
              performanceData.reps &&
              performanceData.targetSets && (
                <div className="flex items-center space-x-4">
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
                    <input
                      type="number"
                      min="0"
                      value={editingActualSets}
                      onChange={handleActualSetsChange}
                      onBlur={handleActualSetsBlur}
                      onKeyPress={handleActualSetsKeyPress}
                      className="w-16 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={isUpdating}
                    />
                    <span className="font-medium">actual</span>
                  </div>
                </div>
              )}
            {performanceData.exerciseType === "Cardio" &&
              performanceData.duration && (
                <div className="flex items-center space-x-1">
                  <Clock size={14} />
                  <span className="font-medium">
                    {performanceData.duration} min
                  </span>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutEditor;
