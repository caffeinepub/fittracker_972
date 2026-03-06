import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ExercisePerformance = {
    __kind__: "strength";
    strength: {
        reps: bigint;
        sets: bigint;
    };
} | {
    __kind__: "cardio";
    cardio: {
        duration: bigint;
    };
};
export interface Exercise {
    id: bigint;
    owner: Principal;
    name: string;
    description: string;
    exerciseType: string;
}
export interface Workout {
    id: bigint;
    exerciseIds: Array<bigint>;
    owner: Principal;
    completed: boolean;
    timestamp: Time;
}
export interface WorkoutPerformanceSerializable {
    workoutId: bigint;
    exercisePerformances: Array<[bigint, ExercisePerformance]>;
}
export type Time = bigint;
export interface UserProfile {
    name: string;
    darkMode: boolean;
}
export interface backendInterface {
    addExercise(name: string, exerciseType: string, description: string): Promise<bigint>;
    addExercisePerformance(workoutId: bigint, exerciseId: bigint, performance: ExercisePerformance): Promise<void>;
    areAllExercisesCompleted(workoutId: bigint, exerciseIds: Array<bigint>): Promise<boolean>;
    completeWorkout(id: bigint): Promise<boolean>;
    copyWorkout(originalWorkoutId: bigint): Promise<bigint>;
    createWorkout(exerciseIds: Array<bigint>): Promise<bigint>;
    deleteWorkout(id: bigint): Promise<boolean>;
    getActualSets(workoutId: bigint, exerciseId: bigint): Promise<bigint>;
    getAllExercises(): Promise<Array<Exercise>>;
    getUserProfile(): Promise<UserProfile | null>;
    getWorkoutHistory(): Promise<Array<Workout>>;
    getWorkoutPerformance(workoutId: bigint): Promise<WorkoutPerformanceSerializable | null>;
    initializeAuth(): Promise<void>;
    isExerciseCompleted(workoutId: bigint, exerciseId: bigint): Promise<boolean>;
    markExerciseComplete(workoutId: bigint, exerciseId: bigint): Promise<void>;
    markExerciseIncomplete(workoutId: bigint, exerciseId: bigint): Promise<void>;
    removeExercise(id: bigint): Promise<boolean>;
    saveUserProfile(name: string): Promise<void>;
    toggleDarkMode(): Promise<void>;
    updateActualSets(workoutId: bigint, exerciseId: bigint, actualSets: bigint): Promise<void>;
}
