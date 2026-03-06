# Fitness Workout Tracker

## Overview

A fitness application that allows users to track their workouts by managing exercises with secure user authentication through Internet Identity. The application requires authentication before accessing any fitness tracking features.

## Authentication System

- Users must authenticate using Internet Identity before accessing the main application
- Login panel is displayed first upon application load
- First user to authenticate becomes admin with full system privileges
- Subsequent users are assigned user role with personal data access
- No guest access - authentication is mandatory for all features

## User Profile Setup

- After successful Internet Identity authentication, check if user has a name set in their profile
- If no name is found, display a name entry form before allowing access to main application
- User must enter their name to proceed to the fitness tracking features
- Name is stored in user profile for personalization throughout the application
- Users with existing names proceed directly to main application after authentication

## Profile Loading State Management

- When a logged-in user refreshes the application or logs in, display a proper loading state while the user profile is being retrieved from the backend
- The loading state is shown immediately after authentication until the profile data is fully loaded and verified from the backend
- The profile setup UI (name entry form) should not appear briefly for users who already have a name set in their profile
- Only after profile verification is complete should the appropriate interface be displayed (main application for users with names, or name entry form for users without names)
- The loading state must properly transition to the correct interface once profile data is loaded, preventing the application from getting stuck in the loading state
- Loading state includes proper error handling to transition to appropriate interface even if profile loading encounters issues
- This prevents the flickering or brief appearance of incorrect UI states during the profile loading process and ensures smooth transitions

## User Profile Management

- Users can update and change their name in their profile after it has been initially set
- Profile editing interface allows users to modify their stored name
- Name changes are immediately reflected throughout the application interface
- Updated names are saved to the user's profile in the backend
- Theme toggle control is located within the user profile section for changing between light and dark themes
- Users can access their theme preference settings directly from their profile interface
- Theme preference changes made in the profile are immediately applied and saved to the backend

## Dark Mode Theme Support

- Dark mode is the default theme for all users including on the login page and throughout the entire application
- Users can toggle between light and dark themes using the theme toggle control located in their profile section
- Theme preference is stored in the user's profile in the backend and is immediately updated when the toggle is used
- Theme preference persists across browser sessions and different devices
- When a user logs in, their saved theme preference is automatically applied from the backend
- New users start with dark mode as their default theme unless they change it to light mode
- All interface elements adapt to the selected theme including navigation, forms, modals, and content areas
- Login page and name entry form display in dark mode by default for all users
- When switching to light mode, the theme preference is immediately saved to the backend and the light theme is correctly applied throughout the entire application
- Theme changes are persistent and correctly applied after page reload or subsequent logins
- Light mode theme is properly applied to all interface elements when selected, ensuring complete visual consistency across the entire application

## Default Exercise Library

- When a new user signs in for the first time, a default set of exercises is automatically added to their personal exercise library
- Default exercises include: Push-ups (Strength), Squats (Strength), Plank (Strength), Jumping Jacks (Cardio), and Lunges (Strength)
- These exercises are added to the user's personal collection during the initial profile setup process
- Default exercises become part of the user's personal exercise library and can be modified or deleted like any other personal exercise

## User Roles

- **Admin**: Full control over all exercises and workout data, can manage user roles
- **User**: Can create, edit, and delete their own exercises and workout history

## Core Features

### Authentication Flow

- Login panel displayed as the primary interface in dark mode by default
- Proper loading state displayed during profile retrieval to prevent UI flickering and ensure smooth transitions
- Loading state properly transitions to the correct interface once profile data is loaded without getting stuck
- Name entry form displayed in dark mode if user profile lacks a name after authentication
- Default exercises automatically added to new user's library during first-time setup
- Main fitness tracking interface only accessible after successful Internet Identity authentication and name setup
- Logout functionality returns user to login panel

### Exercise Management

- Add new exercises with basic details (name, type, description) to personal collection
- Exercise types include "Strength" and "Cardio"
- Remove existing exercises from personal collection
- View list of personal exercises
- New users start with default exercise collection

### Workout Tracking

- Create new workout sessions using personal exercises
- Add exercises from personal library to workout sessions during initial creation
- Add additional exercises to existing workouts over time, allowing workouts to be built progressively
- When new exercises are added to an existing workout, they are immediately stored and persisted in the backend
- Updated workouts correctly include all previously added exercises plus any newly added exercises
- For each exercise added to a workout, record performance data based on exercise type:
  - **Strength exercises**: Record target number of reps and target number of sets planned, plus actual number of sets completed during workout execution
  - **Cardio exercises**: Record duration in minutes performed
- Each exercise within a workout has its own completion status that can be marked individually
- Individual exercises can be marked as completed using a "mark completed" button for each exercise
- Individual exercise completion status is stored and persisted in the backend
- When all exercises in a workout are marked as completed, the entire workout is automatically marked as completed in the backend
- All workout and exercise performance data including actual sets completed is stored in the backend
- View personal workouts with performance data for each exercise retrieved from backend
- Delete individual workouts from personal workout collection
- Admin can view all user workout data

### Strength Exercise Performance Tracking

- For strength exercises, users can directly enter and update the actual number of sets completed using an input field displayed inline within the workout interface
- The actual sets completed input field is always visible for each strength exercise without requiring any edit button clicks
- Users can type directly into the actual sets completed field and the value is automatically saved to the backend in real time as they type or when they finish entering the value
- Each strength exercise in a workout has its own independent actual sets completed input field that can be updated separately from other exercises
- Real-time saving ensures that actual sets completed data is immediately stored in the backend without requiring manual save actions
- Actual sets completed data persists across sessions for each individual exercise
- Workouts display both target sets and actual sets completed for strength exercises
- Actual sets completed information is included in all workout data retrieval and display operations
- Backend properly stores and retrieves the actual sets completed value for each specific exercise within each workout

### Workout Copying

- Copy existing workouts to create new workout sessions
- When copying any workout, all exercises from the original workout are included in the new workout, regardless of their completion status in the original workout
- Copied workouts are created as new workout sessions with all exercises marked as incomplete
- Performance data from the original workout is copied to the new workout including reps and target sets for strength exercises and duration for cardio exercises
- Actual sets completed values are reset to empty/zero in the copied workout
- Users can copy any of their own workouts from their workout collection
- The copy function creates a completely new workout session that can be modified independently

### Real-time Workout Status Updates

- When an exercise is marked as complete or incomplete within a workout view, the interface automatically refreshes to display the updated completion status
- The workout view immediately shows the current completion status of each individual exercise after any status change
- The overall workout completion status is automatically updated and displayed in real-time when exercise completion states change
- No manual page refresh is required to see updated completion statuses

### Exercise Completion Button States

- When a "mark complete" button for an exercise is clicked, a loading spinner is displayed on that specific button
- While the completion action is processing, all other "mark complete" buttons for exercises within the same workout are disabled
- The disabled state prevents users from clicking other completion buttons until the current action finishes
- Once the completion action finishes successfully or with an error, all buttons return to their normal enabled state
- The spinner is removed from the clicked button after the action completes
- This prevents multiple simultaneous completion requests and provides clear visual feedback during processing

## Backend Data Storage

- **Users**: Store user profiles with Internet Identity principals, assigned roles, user names for personalization, and dark mode theme preferences with dark mode as default for new users
- **Personal Exercises**: Store user-specific exercise information with owner association and exercise type (Strength or Cardio)
- **Workouts**: Store workout sessions linked to specific users with associated exercises, completion timestamps, comprehensive performance data (reps and sets for strength exercises, duration in minutes for cardio exercises), actual sets completed for strength exercises, and overall workout completion status
- **Exercise Performance Records**: Store detailed performance data for each exercise within workouts, including reps, target sets, actual sets completed for strength exercises with independent storage per exercise, and duration values linked to specific exercises and workout sessions, plus individual completion status for each exercise
- **Default Exercises**: Store template exercises that are copied to new user accounts with appropriate exercise types

## Backend Operations

- Authenticate users via Internet Identity
- Save user profile name for authenticated users
- Retrieve user profile information including stored name and theme preference with proper loading state support and error handling
- Ensure profile retrieval operations complete successfully to allow proper transition from loading state to main interface
- Handle profile loading errors gracefully to prevent application from getting stuck in loading state
- Update user profile name for authenticated users
- Save and retrieve user dark mode theme preferences with dark mode as default for new users
- Update user theme preferences immediately when toggled and ensure the updated preference is properly stored and persisted
- Check and update user profile names during authentication flow
- Create default exercise set for new users during initial setup
- Initialize new user profiles with dark mode as the default theme preference
- Manage user roles and permissions
- Create, read, and delete personal exercises with exercise type (user-scoped)
- Create workout sessions for authenticated users using personal exercises
- Store and retrieve exercise performance data (reps and sets for strength exercises, duration for cardio exercises) for each exercise in workout sessions
- Store and retrieve actual sets completed data for strength exercises in workout sessions with independent storage and retrieval for each exercise
- Update actual sets completed values for individual strength exercises in real time as users type or modify the values with immediate persistence to the backend
- Save and update the actual sets completed value independently for each strength exercise within a workout with real-time backend synchronization
- Ensure each exercise's actual sets completed value is stored separately and can be updated without affecting other exercises in the same workout
- Add exercises from personal library to user's workout sessions with performance data stored in backend
- Update existing workout sessions by adding new exercises with proper persistence and storage in the backend
- Ensure workout updates correctly store and maintain all exercises including previously added and newly added exercises
- Properly persist workout modifications so that updated workouts retain all exercise additions across sessions
- Mark individual exercises within workouts as completed and persist completion status in backend
- Automatically mark entire workout as completed when all exercises in the workout are marked as completed
- Track completion status of individual exercises within workout sessions in backend storage
- Track overall workout completion status in backend storage
- Retrieve user-specific workouts including all performance data, actual sets completed for strength exercises with correct values for each individual exercise, completion status for each exercise, and overall workout completion status from backend storage
- Delete specific workouts and associated performance data from user's workout collection
- Copy existing workouts by creating new workout sessions that include all exercises from the original workout with all exercises marked as incomplete and performance data copied including reps and target sets for strength exercises and duration for cardio exercises while resetting actual sets completed values
- Admin operations for managing all user data and performance records

## User Interface

- Primary login panel using Internet Identity displayed on application load in dark mode by default
- Proper loading state displayed during profile retrieval after authentication to prevent UI flickering and ensure smooth transitions to the correct interface
- Loading state properly transitions to main application or name entry form based on profile data without getting stuck
- Name entry form displayed in dark mode when user profile lacks a name after authentication
- Profile editing interface allowing users to update their name and change their theme preference using the theme toggle control
- Theme toggle control is integrated within the user profile section for easy access to theme settings
- All interface elements adapt to selected theme including backgrounds, text colors, borders, and interactive elements
- Dark mode is applied by default to all interface elements including login page, name entry form, and main application
- Light mode is correctly applied throughout the entire application when selected, with proper styling for all interface elements
- Theme changes are immediately reflected across all application components and persist after page reload or login
- Light theme is fully implemented and properly applied to all interface components when selected
- Main fitness tracking interface accessible only after authentication and name setup without header or descriptive text
- Exercise library page showing personal exercises with their types
- Workout creation interface for building personal workout sessions with access to personal exercises
- Workout editing interface allowing users to add additional exercises to existing workouts over time with proper backend persistence
- Performance data entry forms that adapt based on exercise type:
  - Strength exercises: Input fields for number of reps, number of target sets, and a directly editable input field for actual sets completed that is always visible and saves values to the backend in real time without requiring edit buttons
  - Cardio exercises: Input field for duration in minutes
- Individual "mark completed" buttons for each exercise within workout sessions
- Exercise completion buttons show loading spinners when clicked and disable all other completion buttons in the same workout during processing
- Workout view automatically refreshes and updates completion status display immediately when exercises are marked complete or incomplete
- Real-time display of individual exercise completion status and overall workout completion status without requiring manual refresh
- Workouts view showing user's workout sessions with performance data retrieved from backend and displayed appropriately:
  - Strength exercises show "X reps, Y target sets, Z actual sets completed" format with correct actual sets completed value for each individual exercise
  - Cardio exercises show "X minutes" format
  - Individual exercise completion status displayed for each exercise
  - Overall workout completion status displayed for each workout
- "Create Workout" button prominently displayed on the Workouts page for easy access to starting a new workout
- Copy workout functionality available in Workouts view with "copy workout" button for each workout
- Delete functionality for individual workouts in Workouts view with styled delete buttons that display both an icon and the word "Delete" to make the action clear to users
- Delete buttons for exercises are styled buttons that display both an icon and the word "Delete" to clearly indicate the destructive action
- All delete buttons throughout the application are styled as proper buttons with consistent visual design, making them visually clear and easy to interact with
- Delete buttons maintain consistent styling across all sections of the application including exercises, workouts, and any other deletable items
- Admin dashboard for managing users and global content
- Role-based access controls throughout the interface
- Simple forms for adding new personal exercises and workouts with user context and exercise type selection
- Logout functionality that returns to login panel
- Personalized interface elements using stored user names that update when name is changed

## Navigation System

- Left sidebar navigation positioned on the left side of the screen for the main application interface on desktop devices
- Sidebar contains navigation links to all major sections: exercises, workouts, and profile
- Navigation remains accessible throughout the application after authentication and name setup
- Sidebar design follows the minimalistic flat design approach with simple navigation items
- Navigation is not displayed during login or name entry phases
- Admin users see additional navigation items for admin functions in the sidebar
- Copyright footer is positioned within the left sidebar at the bottom of the sidebar area
- Footer remains visible within the sidebar layout and maintains consistent styling with the sidebar design
- When hovering over navigation items in the sidebar, the highlight uses a light background color in both dark and light modes
- Hover highlight ensures text remains legible and accessible with proper contrast in both theme modes

## Mobile Responsive Navigation

- On mobile devices, the left sidebar navigation transforms into a collapsible mobile-friendly navigation system
- Mobile navigation uses a hamburger menu button that toggles the navigation menu visibility
- When opened on mobile, the navigation menu slides in from the side and overlays the main content
- The mobile navigation menu is positioned above any overlay elements to ensure navigation items remain fully interactive and tappable
- Navigation menu items are sized appropriately for touch interaction on mobile devices
- The navigation menu automatically closes when a navigation item is selected on mobile
- Copyright footer remains accessible within the mobile navigation menu
- Mobile navigation maintains the same flat design principles and theme support as the desktop sidebar
- When the mobile sidebar is open, users can tap navigation options without any overlay interference blocking interaction with menu items

## Modal Dialog System

- All notifications, confirmations, and alerts are displayed using in-browser modal dialogs instead of browser alert windows
- Modal dialogs provide a modern and seamless user experience that stays within the application interface
- Confirmation dialogs for destructive actions like deleting exercises or workouts use modal dialogs with clear action buttons
- Success and error notifications are displayed in modal dialogs with appropriate styling and messaging
- Modal dialogs can be dismissed by clicking outside the modal area or using a close button
- Modal dialogs maintain focus and accessibility standards for keyboard navigation
- Modal dialogs adapt to the selected theme with appropriate colors and styling

## Mobile Responsive Modal Dialogs

- Modal dialogs are fully responsive and adapt to mobile screen sizes
- On mobile devices, modals resize to fit the screen width with appropriate margins
- Modal content is scrollable on mobile when content exceeds screen height
- Modal buttons are sized appropriately for touch interaction on mobile devices
- Close buttons and interactive elements in modals are easily accessible on touch screens
- Modal dialogs maintain proper spacing and readability on small screens

## Design System

- Minimalistic design approach with flat colors and simple layouts throughout the application
- No drop shadows or subtle gradients on any components, backgrounds, or buttons
- Clean, modern appearance using solid colors and simple geometric shapes
- Consistent flat design language applied to all interface elements including cards, buttons, forms, navigation, and sidebar
- Simple color palette with clear contrast for readability and accessibility in both light and dark themes
- Dark theme is the default theme and uses appropriate dark backgrounds with light text maintaining the same flat design principles
- Light theme uses light backgrounds with dark text following the established flat design approach
- Streamlined visual hierarchy using typography, spacing, and flat color blocks rather than visual effects
- Left sidebar navigation maintains the same flat design principles with simple, clean styling in both themes
- Footer within the sidebar follows the same flat design principles and integrates seamlessly with the sidebar styling in both themes
- Theme transitions are smooth and all interface elements properly adapt to the selected theme
- Login page and name entry form follow the same flat design principles in dark mode by default
- Workout components in dark mode use background colors that match or closely resemble the sidebar's background color to ensure visual consistency and a unified appearance throughout the application

## Mobile Responsive Design System

- All interface elements are fully responsive and adapt to different screen sizes
- Typography scales appropriately for mobile devices while maintaining readability
- Buttons and interactive elements are sized for touch interaction with adequate touch targets
- Form inputs and controls are optimized for mobile input methods
- Spacing and padding adjust appropriately for smaller screens
- Content layouts stack vertically on mobile devices when horizontal space is limited
- Cards and containers resize fluidly to fit mobile screen widths
- The flat design principles are maintained across all screen sizes

## Workout Card Hover Effects

- Workout cards have very subtle hover effects with minimal background color changes in both dark and light modes
- Hover highlight is extremely subtle to preserve the visual hierarchy and ensure exercises within the workout remain clearly distinguishable
- The subtle hover effect provides gentle user feedback without overwhelming the workout content or interfering with exercise readability
- Hover effects maintain the flat design principles with no shadows or gradients, using only very light background color adjustments
- The subtle nature of the hover effect ensures that individual exercises and their completion status remain the primary visual focus within workout cards

## Mobile Responsive Workout Cards

- Workout cards are fully responsive and adapt to mobile screen widths
- On mobile devices, workout cards stack vertically and utilize the full screen width
- Exercise information within workout cards is displayed in a mobile-friendly layout
- Performance data and completion buttons are appropriately sized for touch interaction
- Actual sets completed input fields are optimized for mobile keyboard input
- Card content maintains proper spacing and readability on small screens
- Hover effects are replaced with appropriate touch feedback on mobile devices

## Mobile Responsive Forms

- All forms throughout the application are optimized for mobile devices
- Form inputs are sized appropriately for touch interaction with adequate spacing
- Input fields utilize appropriate mobile keyboard types (numeric for numbers, etc.)
- Form layouts adapt to mobile screen sizes with proper spacing and alignment
- Submit buttons are sized for easy touch interaction
- Form validation messages display properly on mobile screens
- Multi-step forms or complex forms break down appropriately for mobile viewing

## Mobile Responsive Layout System

- The overall application layout adapts seamlessly between desktop and mobile viewports
- Content areas resize fluidly to accommodate different screen sizes
- Main content areas stack appropriately on mobile devices
- Sidebar navigation transforms into mobile-friendly navigation patterns
- Page headers and titles scale appropriately for mobile screens
- Loading states and transitions work smoothly across all device sizes
- The application maintains full functionality across all responsive breakpoints
