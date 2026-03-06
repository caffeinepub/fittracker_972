import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type {
  Exercise,
  Workout,
  UserProfile,
  ExercisePerformance,
  WorkoutPerformanceSerializable,
} from "../backend";

// User profile queries
export function useUserProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return await actor.getUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      if (!actor) throw new Error("Actor not available");
      return await actor.saveUserProfile(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// Dark mode toggle
export function useToggleDarkMode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return await actor.toggleDarkMode();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// Default exercises setup for new users
export function useSetupDefaultExercises() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const defaultExercises = [
    {
      name: "Push-ups",
      exerciseType: "Strength",
      description:
        "Classic upper body exercise targeting chest, shoulders, and triceps",
    },
    {
      name: "Squats",
      exerciseType: "Strength",
      description:
        "Lower body exercise targeting quadriceps, hamstrings, and glutes",
    },
    {
      name: "Plank",
      exerciseType: "Strength",
      description:
        "Core strengthening exercise that also engages shoulders and back",
    },
    {
      name: "Jumping Jacks",
      exerciseType: "Cardio",
      description:
        "Full body cardio exercise that increases heart rate and coordination",
    },
    {
      name: "Lunges",
      exerciseType: "Strength",
      description:
        "Single-leg exercise targeting quadriceps, hamstrings, and glutes",
    },
  ];

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");

      // Add all default exercises sequentially to ensure proper error handling
      const results: any[] = [];
      for (const exercise of defaultExercises) {
        try {
          const exerciseId = await actor.addExercise(
            exercise.name,
            exercise.exerciseType,
            exercise.description,
          );
          results.push(exerciseId);
        } catch (error) {
          console.error(`Failed to add exercise ${exercise.name}:`, error);
          // Continue adding other exercises even if one fails
        }
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

// Exercise queries
export function useExercises() {
  const { actor, isFetching } = useActor();

  return useQuery<Exercise[]>({
    queryKey: ["exercises"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllExercises();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddExercise() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      exerciseType,
      description,
    }: {
      name: string;
      exerciseType: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addExercise(name, exerciseType, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

export function useRemoveExercise() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeExercise(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

// Workout queries
export function useWorkoutHistory() {
  const { actor, isFetching } = useActor();

  return useQuery<Workout[]>({
    queryKey: ["workouts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWorkoutHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateWorkout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      exerciseIds,
      performanceData,
    }: {
      exerciseIds: bigint[];
      performanceData: Record<
        string,
        {
          reps?: number;
          targetSets?: number;
          actualSets?: number;
          duration?: number;
          exerciseType: string;
        }
      >;
    }) => {
      if (!actor) throw new Error("Actor not available");

      // Create the workout first
      const workoutId = await actor.createWorkout(exerciseIds);

      // Add performance data for each exercise
      for (const exerciseId of exerciseIds) {
        const performance = performanceData[exerciseId.toString()];
        if (performance) {
          let exercisePerformance: ExercisePerformance;

          if (
            performance.exerciseType === "Strength" &&
            performance.reps &&
            performance.targetSets
          ) {
            // For strength exercises, store target sets in the sets field
            exercisePerformance = {
              __kind__: "strength",
              strength: {
                reps: BigInt(performance.reps),
                sets: BigInt(performance.targetSets),
              },
            };
          } else if (
            performance.exerciseType === "Cardio" &&
            performance.duration
          ) {
            exercisePerformance = {
              __kind__: "cardio",
              cardio: { duration: BigInt(performance.duration) },
            };
          } else {
            continue; // Skip if no valid performance data
          }

          await actor.addExercisePerformance(
            workoutId,
            exerciseId,
            exercisePerformance,
          );

          // Store actual sets if provided
          if (
            performance.exerciseType === "Strength" &&
            performance.actualSets !== undefined
          ) {
            await actor.updateActualSets(
              workoutId,
              exerciseId,
              BigInt(performance.actualSets),
            );
          }
        }
      }

      return workoutId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["workoutPerformance"] });
      queryClient.invalidateQueries({ queryKey: ["exerciseCompletion"] });
      queryClient.invalidateQueries({ queryKey: ["actualSets"] });
    },
  });
}

export function useDeleteWorkout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteWorkout(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["workoutPerformance"] });
      queryClient.invalidateQueries({ queryKey: ["exerciseCompletion"] });
      queryClient.invalidateQueries({ queryKey: ["actualSets"] });
    },
  });
}

export function useCopyWorkout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (originalWorkoutId: bigint) => {
      if (!actor) throw new Error("Actor not available");

      // Use the backend copyWorkout function which copies performance data
      const newWorkoutId = await actor.copyWorkout(originalWorkoutId);

      // Get the original workout to access its exercises
      const workouts = await actor.getWorkoutHistory();
      const originalWorkout = workouts.find((w) => w.id === originalWorkoutId);

      if (originalWorkout) {
        // Reset actual sets completed to 0 for all exercises in the copied workout
        for (const exerciseId of originalWorkout.exerciseIds) {
          await actor.updateActualSets(newWorkoutId, exerciseId, BigInt(0));
        }
      }

      return newWorkoutId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["workoutPerformance"] });
      queryClient.invalidateQueries({ queryKey: ["exerciseCompletion"] });
      queryClient.invalidateQueries({ queryKey: ["actualSets"] });
    },
  });
}

// Workout performance queries
export function useWorkoutPerformance(workoutId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<WorkoutPerformanceSerializable | null>({
    queryKey: ["workoutPerformance", workoutId?.toString()],
    queryFn: async () => {
      if (!actor || !workoutId) return null;
      return await actor.getWorkoutPerformance(workoutId);
    },
    enabled: !!actor && !isFetching && !!workoutId,
  });
}

// Add exercise performance to workout
export function useAddExercisePerformance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workoutId,
      exerciseId,
      performance,
    }: {
      workoutId: bigint;
      exerciseId: bigint;
      performance: ExercisePerformance;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return await actor.addExercisePerformance(
        workoutId,
        exerciseId,
        performance,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workoutPerformance", variables.workoutId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["actualSets"] });
    },
  });
}

// Backend-based actual sets storage
export function useUpdateActualSets() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workoutId,
      exerciseId,
      actualSets,
    }: {
      workoutId: bigint;
      exerciseId: bigint;
      actualSets: number;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateActualSets(workoutId, exerciseId, BigInt(actualSets));
      return { workoutId, exerciseId, actualSets };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "actualSets",
          variables.workoutId.toString(),
          variables.exerciseId.toString(),
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["workoutPerformance", variables.workoutId.toString()],
      });
    },
  });
}

// Get actual sets completed for a specific exercise from backend
export function useActualSets(workoutId: bigint, exerciseId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ["actualSets", workoutId.toString(), exerciseId.toString()],
    queryFn: async () => {
      if (!actor) return 0;
      const result = await actor.getActualSets(workoutId, exerciseId);
      return Number(result);
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

// Add exercise to existing workout - creates a new workout with combined exercises
export function useAddExerciseToWorkout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workoutId,
      exerciseIds,
      performanceData,
    }: {
      workoutId: bigint;
      exerciseIds: bigint[];
      performanceData: Record<
        string,
        {
          reps?: number;
          targetSets?: number;
          actualSets?: number;
          duration?: number;
          exerciseType: string;
        }
      >;
    }) => {
      if (!actor) throw new Error("Actor not available");

      // Get the current workout to retrieve existing exercises
      const workouts = await actor.getWorkoutHistory();
      const currentWorkout = workouts.find((w) => w.id === workoutId);

      if (!currentWorkout) {
        throw new Error("Workout not found");
      }

      // Combine existing exercises with new ones
      const combinedExerciseIds = [
        ...currentWorkout.exerciseIds,
        ...exerciseIds,
      ];

      // Create a new workout with all exercises (existing + new)
      const newWorkoutId = await actor.createWorkout(combinedExerciseIds);

      // Copy existing performance data from the original workout
      const existingPerformance = await actor.getWorkoutPerformance(workoutId);
      if (existingPerformance) {
        for (const e of existingPerformance.exercisePerformances) {
          await actor.addExercisePerformance(newWorkoutId, e[0], e[1]);
        }
      }

      // Copy actual sets data from backend
      for (const exerciseId of currentWorkout.exerciseIds) {
        const actualSets = await actor.getActualSets(workoutId, exerciseId);
        if (actualSets > 0) {
          await actor.updateActualSets(newWorkoutId, exerciseId, actualSets);
        }
      }

      // Add performance data for new exercises
      for (const exerciseId of exerciseIds) {
        const performance = performanceData[exerciseId.toString()];
        if (performance) {
          let exercisePerformance: ExercisePerformance;

          if (
            performance.exerciseType === "Strength" &&
            performance.reps &&
            performance.targetSets
          ) {
            exercisePerformance = {
              __kind__: "strength",
              strength: {
                reps: BigInt(performance.reps),
                sets: BigInt(performance.targetSets),
              },
            };
          } else if (
            performance.exerciseType === "Cardio" &&
            performance.duration
          ) {
            exercisePerformance = {
              __kind__: "cardio",
              cardio: { duration: BigInt(performance.duration) },
            };
          } else {
            continue; // Skip if no valid performance data
          }

          await actor.addExercisePerformance(
            newWorkoutId,
            exerciseId,
            exercisePerformance,
          );

          // Store actual sets for new exercises if provided
          if (
            performance.exerciseType === "Strength" &&
            performance.actualSets !== undefined
          ) {
            await actor.updateActualSets(
              newWorkoutId,
              exerciseId,
              BigInt(performance.actualSets),
            );
          }
        }
      }

      // Copy exercise completion status from the original workout
      for (const exerciseId of currentWorkout.exerciseIds) {
        const isCompleted = await actor.isExerciseCompleted(
          workoutId,
          exerciseId,
        );
        if (isCompleted) {
          await actor.markExerciseComplete(newWorkoutId, exerciseId);
        }
      }

      // Delete the original workout
      await actor.deleteWorkout(workoutId);

      return {
        success: true,
        workoutId: newWorkoutId,
        exerciseIds: combinedExerciseIds,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["workoutPerformance"] });
      queryClient.invalidateQueries({ queryKey: ["exerciseCompletion"] });
      queryClient.invalidateQueries({ queryKey: ["actualSets"] });
    },
  });
}

// Exercise completion queries using backend
export function useMarkExerciseComplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workoutId,
      exerciseId,
    }: {
      workoutId: bigint;
      exerciseId: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.markExerciseComplete(workoutId, exerciseId);
      return { workoutId, exerciseId, completed: true };
    },
    onSuccess: (_, variables) => {
      // Invalidate all exercise completion queries for this workout
      queryClient.invalidateQueries({
        queryKey: ["exerciseCompletion", variables.workoutId.toString()],
      });
      // Invalidate the specific exercise completion query
      queryClient.invalidateQueries({
        queryKey: [
          "exerciseCompletion",
          variables.workoutId.toString(),
          variables.exerciseId.toString(),
        ],
      });
      // Invalidate all exercises completed query for this workout
      queryClient.invalidateQueries({
        queryKey: ["allExercisesCompleted", variables.workoutId.toString()],
      });
      // Invalidate workouts to refresh overall workout completion status
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function useMarkExerciseIncomplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workoutId,
      exerciseId,
    }: {
      workoutId: bigint;
      exerciseId: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.markExerciseIncomplete(workoutId, exerciseId);
      return { workoutId, exerciseId, completed: false };
    },
    onSuccess: (_, variables) => {
      // Invalidate all exercise completion queries for this workout
      queryClient.invalidateQueries({
        queryKey: ["exerciseCompletion", variables.workoutId.toString()],
      });
      // Invalidate the specific exercise completion query
      queryClient.invalidateQueries({
        queryKey: [
          "exerciseCompletion",
          variables.workoutId.toString(),
          variables.exerciseId.toString(),
        ],
      });
      // Invalidate all exercises completed query for this workout
      queryClient.invalidateQueries({
        queryKey: ["allExercisesCompleted", variables.workoutId.toString()],
      });
      // Invalidate workouts to refresh overall workout completion status
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

// Helper function to check if an exercise is completed using backend
export function useIsExerciseCompleted(workoutId: bigint, exerciseId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: [
      "exerciseCompletion",
      workoutId.toString(),
      exerciseId.toString(),
    ],
    queryFn: async () => {
      if (!actor) return false;
      return await actor.isExerciseCompleted(workoutId, exerciseId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 0, // Always refetch to ensure real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
}

// Helper function to check if all exercises in a workout are completed using backend
export function useAreAllExercisesCompleted(
  workoutId: bigint,
  exerciseIds: bigint[],
) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["allExercisesCompleted", workoutId.toString()],
    queryFn: async () => {
      if (!actor || exerciseIds.length === 0) return false;
      return await actor.areAllExercisesCompleted(workoutId, exerciseIds);
    },
    enabled: !!actor && !isFetching && exerciseIds.length > 0,
    staleTime: 0, // Always refetch to ensure real-time updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
}
