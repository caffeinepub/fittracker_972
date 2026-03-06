import React, { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Plus, Trash2, X, User } from "lucide-react";
import {
  useExercises,
  useAddExercise,
  useRemoveExercise,
} from "../hooks/useQueries";
import { useModal, useConfirmationModal } from "../hooks/useModal";
import NotificationModal from "./NotificationModal";
import ConfirmationModal from "./ConfirmationModal";

const ExerciseLibrary: React.FC = () => {
  const { identity } = useInternetIdentity();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    exerciseType: "",
    description: "",
  });

  const { data: exercises = [], isLoading: exercisesLoading } = useExercises();
  const addExerciseMutation = useAddExercise();
  const removeExerciseMutation = useRemoveExercise();

  const { modalState, hideModal, showSuccess, showError } = useModal();
  const {
    isOpen: confirmationOpen,
    confirmationData,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
  } = useConfirmationModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.exerciseType.trim()) return;

    try {
      await addExerciseMutation.mutateAsync(formData);
      setFormData({ name: "", exerciseType: "", description: "" });
      setShowAddForm(false);
      showSuccess(
        "Exercise Added",
        "Your exercise has been successfully added to your library.",
      );
    } catch (error) {
      console.error("Failed to add exercise:", error);
      showError("Error", "Failed to add exercise. Please try again.");
    }
  };

  const handleRemove = async (id: bigint, exerciseName: string) => {
    showConfirmation(
      "Delete Exercise",
      `Are you sure you want to remove "${exerciseName}" from your exercise library? This action cannot be undone.`,
      async () => {
        try {
          await removeExerciseMutation.mutateAsync(id);
          showSuccess(
            "Exercise Removed",
            "The exercise has been successfully removed from your library.",
          );
        } catch (error) {
          console.error("Failed to remove exercise:", error);
          showError("Error", "Failed to remove exercise. Please try again.");
        }
      },
      { type: "danger", confirmText: "Delete", cancelText: "Cancel" },
    );
  };

  const canRemoveExercise = (exercise: any) => {
    if (!identity) return false;
    return exercise.owner.toString() === identity.getPrincipal().toString();
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Exercise Library
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Add Exercise</span>
        </button>
      </div>

      {/* Add Exercise Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Add New Exercise
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exercise Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                placeholder="e.g., Push-ups"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exercise Type *
              </label>
              <select
                value={formData.exerciseType}
                onChange={(e) =>
                  setFormData({ ...formData, exerciseType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                required
              >
                <option value="">Select type</option>
                <option value="Strength">Strength</option>
                <option value="Cardio">Cardio</option>
                <option value="Flexibility">Flexibility</option>
                <option value="Balance">Balance</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                rows={3}
                placeholder="Describe the exercise..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={addExerciseMutation.isPending}
                className="bg-green-600 text-white px-4 py-2 hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                {addExerciseMutation.isPending && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>Add Exercise</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exercise List */}
      {exercises.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <User size={48} className="mx-auto" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            No exercises yet. Add your first exercise to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((exercise) => (
            <div
              key={exercise.id.toString()}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg pr-2">
                  {exercise.name}
                </h3>
                {canRemoveExercise(exercise) && (
                  <button
                    onClick={() => handleRemove(exercise.id, exercise.name)}
                    disabled={removeExerciseMutation.isPending}
                    className="bg-red-600 text-white px-3 py-2 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2 text-sm flex-shrink-0"
                  >
                    {removeExerciseMutation.isPending ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    ) : (
                      <Trash2 size={14} />
                    )}
                    <span>Delete</span>
                  </button>
                )}
              </div>

              <div className="mb-3">
                <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1">
                  {exercise.exerciseType}
                </span>
              </div>

              {exercise.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {exercise.description}
                </p>
              )}
            </div>
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
        isLoading={removeExerciseMutation.isPending}
      />
    </div>
  );
};

export default ExerciseLibrary;
