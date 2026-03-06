import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";

actor {
  type UserRole = {
    #admin;
    #user;
    #guest;
  };

  type UserProfile = {
    name : Text;
    darkMode : Bool;
  };

  type Exercise = {
    id : Nat;
    name : Text;
    exerciseType : Text;
    description : Text;
    owner : Principal;
  };

  type Workout = {
    id : Nat;
    exerciseIds : [Nat];
    timestamp : Time.Time;
    completed : Bool;
    owner : Principal;
  };

  type ExercisePerformance = {
    #strength : { reps : Nat; sets : Nat };
    #cardio : { duration : Nat };
  };

  type WorkoutPerformance = {
    workoutId : Nat;
    exercisePerformances : Map.Map<Nat, ExercisePerformance>;
  };

  type WorkoutPerformanceSerializable = {
    workoutId : Nat;
    exercisePerformances : [(Nat, ExercisePerformance)];
  };

  var nextExerciseId : Nat = 0;
  var nextWorkoutId : Nat = 0;
  var exercises : Map.Map<Nat, Exercise> = Map.empty<Nat, Exercise>();
  var workouts : Map.Map<Nat, Workout> = Map.empty<Nat, Workout>();
  var userRoles : Map.Map<Principal, UserRole> = Map.empty<Principal, UserRole>();
  var userProfiles : Map.Map<Principal, UserProfile> = Map.empty<Principal, UserProfile>();
  var adminAssigned : Bool = false;
  var workoutPerformances : Map.Map<Nat, WorkoutPerformance> = Map.empty<Nat, WorkoutPerformance>();
  var exerciseCompletions : Map.Map<Nat, [Nat]> = Map.empty<Nat, [Nat]>();
  var actualSetsCompleted : Map.Map<Nat, Map.Map<Nat, Nat>> = Map.empty<Nat, Map.Map<Nat, Nat>>();

  public shared ({ caller }) func initializeAuth() : async () {
    if (caller.isAnonymous()) { () } else {
      if (not userRoles.containsKey(caller)) {
        if (not adminAssigned) {
          userRoles.add(caller, #admin);
          adminAssigned := true;
        } else {
          userRoles.add(caller, #user);
        };
      };
    };
  };

  func getUserRole(caller : Principal) : UserRole {
    if (caller.isAnonymous()) {
      #guest;
    } else {
      switch (userRoles.get(caller)) {
        case (?role) { role };
        case (null) {
          Runtime.trap("User not found");
        };
      };
    };
  };

  func hasPermission(caller : Principal, requiredRole : UserRole) : Bool {
    var role = getUserRole(caller);

    switch (role) {
      case (#admin) { true };
      case (role) {
        switch (requiredRole) {
          case (#admin) { false };
          case (#user) { role == #user };
          case (#guest) { true };
        };
      };
    };
  };

  public shared ({ caller }) func addExercise(name : Text, exerciseType : Text, description : Text) : async Nat {
    if (not (hasPermission(caller, #user))) {
      Runtime.trap("Unauthorized: Only users and admins can add exercises");
    };
    let id = nextExerciseId;
    let exercise : Exercise = {
      id;
      name;
      exerciseType;
      description;
      owner = caller;
    };
    exercises.add(id, exercise);
    nextExerciseId += 1;
    id;
  };

  public shared ({ caller }) func removeExercise(id : Nat) : async Bool {
    if (not (hasPermission(caller, #user))) {
      Runtime.trap("Unauthorized: Only users and admins can remove exercises");
    };
    switch (exercises.get(id)) {
      case (?exercise) {
        if (exercise.owner != caller and not (hasPermission(caller, #admin))) {
          Runtime.trap("Unauthorized: Only the owner or admins can remove this exercise");
        };
        exercises.remove(id);
        true;
      };
      case (null) { false };
    };
  };

  public query ({ caller }) func getAllExercises() : async [Exercise] {
    let role = getUserRole(caller);
    switch (role) {
      case (#admin) {
        exercises.values().toArray();
      };
      case (#user) {
        var userExercises = Map.empty<Nat, Exercise>();
        for ((id, exercise) in exercises.entries()) {
          if (exercise.owner == caller) {
            userExercises.add(id, exercise);
          };
        };
        userExercises.values().toArray();
      };
      case (#guest) {
        [];
      };
    };
  };

  public shared ({ caller }) func createWorkout(exerciseIds : [Nat]) : async Nat {
    if (not (hasPermission(caller, #user))) {
      Runtime.trap("Unauthorized: Only users and admins can create workouts");
    };
    let id = nextWorkoutId;
    let workout : Workout = {
      id;
      exerciseIds;
      timestamp = Time.now();
      completed = false;
      owner = caller;
    };
    workouts.add(id, workout);
    nextWorkoutId += 1;
    id;
  };

  public shared ({ caller }) func completeWorkout(id : Nat) : async Bool {
    if (not (hasPermission(caller, #user))) {
      Runtime.trap("Unauthorized: Only users and admins can complete workouts");
    };
    switch (workouts.get(id)) {
      case (null) { false };
      case (?workout) {
        if (workout.owner != caller and not (hasPermission(caller, #admin))) {
          Runtime.trap("Unauthorized: Only the owner or admins can complete this workout");
        };
        let updatedWorkout : Workout = {
          id = workout.id;
          exerciseIds = workout.exerciseIds;
          timestamp = workout.timestamp;
          completed = true;
          owner = workout.owner;
        };
        workouts.add(id, updatedWorkout);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteWorkout(id : Nat) : async Bool {
    if (not (hasPermission(caller, #user))) {
      Runtime.trap("Unauthorized: Only users and admins can delete workouts");
    };
    switch (workouts.get(id)) {
      case (?workout) {
        if (workout.owner != caller and not (hasPermission(caller, #admin))) {
          Runtime.trap("Unauthorized: Only the owner or admins can delete this workout");
        };
        workouts.remove(id);
        true;
      };
      case (null) { false };
    };
  };

  public query ({ caller }) func getWorkoutHistory() : async [Workout] {
    let role = getUserRole(caller);
    switch (role) {
      case (#admin) {
        workouts.values().toArray();
      };
      case (#user) {
        var userWorkouts = Map.empty<Nat, Workout>();
        for ((id, workout) in workouts.entries()) {
          if (workout.owner == caller) {
            userWorkouts.add(id, workout);
          };
        };
        userWorkouts.values().toArray();
      };
      case (#guest) {
        [];
      };
    };
  };

  public query ({ caller }) func getUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveUserProfile(name : Text) : async () {
    userProfiles.add(caller, { name; darkMode = true });
  };

  public shared ({ caller }) func addExercisePerformance(workoutId : Nat, exerciseId : Nat, performance : ExercisePerformance) : async () {
    if (not (hasPermission(caller, #user))) {
      Runtime.trap("Unauthorized: Only users and admins can add performance data");
    };

    switch (workoutPerformances.get(workoutId)) {
      case (null) {
        let exercisePerformancesMap = Map.empty<Nat, ExercisePerformance>();
        exercisePerformancesMap.add(exerciseId, performance);
        workoutPerformances.add(workoutId, { workoutId; exercisePerformances = exercisePerformancesMap });
      };
      case (?workoutPerformance) {
        workoutPerformance.exercisePerformances.add(exerciseId, performance);
      };
    };
  };

  public query ({ caller }) func getWorkoutPerformance(workoutId : Nat) : async ?WorkoutPerformanceSerializable {
    if (not (hasPermission(caller, #user))) {
      Runtime.trap("Unauthorized: Only users and admins can view performance data");
    };
    switch (workoutPerformances.get(workoutId)) {
      case (null) { null };
      case (?workoutPerformance) {
        ?{
          workoutId = workoutPerformance.workoutId;
          exercisePerformances = workoutPerformance.exercisePerformances.entries().toArray();
        };
      };
    };
  };

  public shared ({ caller }) func markExerciseComplete(workoutId : Nat, exerciseId : Nat) : async () {
    if (not (hasPermission(caller, #user))) {
      Runtime.trap("Unauthorized: Only users and admins can mark exercises as complete");
    };

    // Update exercise completions
    switch (exerciseCompletions.get(workoutId)) {
      case (null) {
        exerciseCompletions.add(workoutId, [exerciseId]);
      };
      case (?completedExercises) {
        if (completedExercises.find(func(id) { id == exerciseId }) == null) {
          exerciseCompletions.add(workoutId, completedExercises.concat([exerciseId]));
        };
      };
    };

    // Check if all exercises are completed and mark workout as completed if so
    switch (workouts.get(workoutId)) {
      case (?workout) {
        switch (exerciseCompletions.get(workoutId)) {
          case (?completedExercises) {
            let allCompleted = workout.exerciseIds.foldLeft(
              true,
              func(acc, id) {
                acc and (completedExercises.find(func(completedId) { completedId == id }) != null);
              },
            );

            if (allCompleted) {
              let updatedWorkout : Workout = {
                id = workout.id;
                exerciseIds = workout.exerciseIds;
                timestamp = workout.timestamp;
                completed = true;
                owner = workout.owner;
              };
              workouts.add(workoutId, updatedWorkout);
            };
          };
          case (null) {};
        };
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func markExerciseIncomplete(workoutId : Nat, exerciseId : Nat) : async () {
    if (not (hasPermission(caller, #user))) {
      Runtime.trap("Unauthorized: Only users and admins can mark exercises as incomplete");
    };

    switch (exerciseCompletions.get(workoutId)) {
      case (null) { () };
      case (?completedExercises) {
        exerciseCompletions.add(workoutId, completedExercises.filter(func(id) { id != exerciseId }));
      };
    };

    // Mark workout as incomplete if any exercise is incomplete
    switch (workouts.get(workoutId)) {
      case (?workout) {
        let updatedWorkout : Workout = {
          id = workout.id;
          exerciseIds = workout.exerciseIds;
          timestamp = workout.timestamp;
          completed = false;
          owner = workout.owner;
        };
        workouts.add(workoutId, updatedWorkout);
      };
      case (null) {};
    };
  };

  public query func isExerciseCompleted(workoutId : Nat, exerciseId : Nat) : async Bool {
    switch (exerciseCompletions.get(workoutId)) {
      case (null) { false };
      case (?completedExercises) {
        completedExercises.find(func(id) { id == exerciseId }) != null;
      };
    };
  };

  public query func areAllExercisesCompleted(workoutId : Nat, exerciseIds : [Nat]) : async Bool {
    switch (exerciseCompletions.get(workoutId)) {
      case (null) { false };
      case (?completedExercises) {
        exerciseIds.foldLeft(
          true,
          func(acc, id) {
            acc and (completedExercises.find(func(completedId) { completedId == id }) != null);
          },
        );
      };
    };
  };

  public shared ({ caller }) func copyWorkout(originalWorkoutId : Nat) : async Nat {
    if (not (hasPermission(caller, #user))) {
      Runtime.trap("Unauthorized: Only users and admins can copy workouts");
    };

    switch (workouts.get(originalWorkoutId)) {
      case (null) {
        Runtime.trap("Original workout not found");
      };
      case (?originalWorkout) {
        if (originalWorkout.owner != caller and not (hasPermission(caller, #admin))) {
          Runtime.trap("Unauthorized: Only the owner or admins can copy this workout");
        };

        // Create new workout with all exercises from the original workout
        let newWorkoutId = nextWorkoutId;
        let newWorkout : Workout = {
          id = newWorkoutId;
          exerciseIds = originalWorkout.exerciseIds;
          timestamp = Time.now();
          completed = false;
          owner = caller;
        };

        workouts.add(newWorkoutId, newWorkout);
        nextWorkoutId += 1;

        // Copy performance data from original workout
        switch (workoutPerformances.get(originalWorkoutId)) {
          case (null) {};
          case (?originalPerformance) {
            workoutPerformances.add(newWorkoutId, originalPerformance);
          };
        };

        newWorkoutId;
      };
    };
  };

  public shared ({ caller }) func toggleDarkMode() : async () {
    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("User profile not found");
      };
      case (?profile) {
        let updatedProfile : UserProfile = {
          name = profile.name;
          darkMode = not profile.darkMode;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func updateActualSets(workoutId : Nat, exerciseId : Nat, actualSets : Nat) : async () {
    if (not (hasPermission(caller, #user))) {
      Runtime.trap("Unauthorized: Only users and admins can update actual sets");
    };

    switch (actualSetsCompleted.get(workoutId)) {
      case (null) {
        let exerciseMap = Map.empty<Nat, Nat>();
        exerciseMap.add(exerciseId, actualSets);
        actualSetsCompleted.add(workoutId, exerciseMap);
      };
      case (?exerciseMap) {
        exerciseMap.add(exerciseId, actualSets);
      };
    };
  };

  public query func getActualSets(workoutId : Nat, exerciseId : Nat) : async Nat {
    switch (actualSetsCompleted.get(workoutId)) {
      case (null) { 0 };
      case (?exerciseMap) {
        switch (exerciseMap.get(exerciseId)) {
          case (null) { 0 };
          case (?sets) { sets };
        };
      };
    };
  };
};
